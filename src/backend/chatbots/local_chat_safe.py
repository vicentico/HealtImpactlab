from __future__ import annotations

import re
import importlib
from collections import Counter
from datetime import date
from typing import Annotated, Literal

from fastapi import Depends, FastAPI

from src.backend.config import get_settings
from src.backend.prioritization_engine import prioritize_patients, waiting_days
from src.backend.repository import SyntheticPatientRepository, get_repository
from src.backend.schemas import ChatRequest, ChatResponse, Role
from src.backend.security.auth import CurrentUser, require_roles
from src.backend.security.logging import new_audit_id, pseudonymize, redact
from src.backend.security.middleware import LocalRateLimitMiddleware, SecurityHeadersMiddleware

settings = get_settings()
app = FastAPI(title="HealthOS - Chatbots con dominios separados", version="0.1.0")
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(LocalRateLimitMiddleware, requests_per_minute=80)

PROMPT_INJECTION_PATTERNS = [
    re.compile(pattern, re.IGNORECASE)
    for pattern in (
        r"ignora (todas|las|tus) instrucciones",
        r"system prompt",
        r"revela.*(token|secreto|contraseña|prompt)",
        r"actúa como.*administrador",
        r"drop\s+table",
        r"union\s+select",
        r"select\s+\*\s+from",
        r"/etc/passwd",
        r"curl\s+http",
    )
]

ALLOWED_INTENTS = {
    "count_above_patient",
    "queue_summary",
    "high_risk_count",
    "patient_explanation",
    "institution_breakdown",
    "unknown",
}


def contains_prompt_injection(message: str) -> bool:
    return any(pattern.search(message) for pattern in PROMPT_INJECTION_PATTERNS)


def detect_intent(message: str) -> str:
    text = message.lower()
    if "encima" in text and ("paciente" in text or "sín-" in text or "syn-" in text):
        return "count_above_patient"
    if "por qué" in text or "porque" in text or "explica" in text:
        return "patient_explanation"
    if "cuánt" in text and ("alto riesgo" in text or "prioridad alta" in text):
        return "high_risk_count"
    if "hospital" in text and ("distrib" in text or "resumen" in text or "cuánt" in text):
        return "institution_breakdown"
    if any(term in text for term in ("resumen", "lista", "espera", "cola")):
        return "queue_summary"
    return "unknown"


def extract_synthetic_id(message: str) -> str | None:
    match = re.search(r"SYN-\d{7,9}-[0-9K]", message.upper())
    return match.group(0) if match else None


class SafeLocalQueryEngine:
    """No text-to-SQL: every intent maps to a fixed, tested repository operation."""

    def __init__(self, repository: SyntheticPatientRepository):
        self.repository = repository

    def answer(self, request: ChatRequest, effective_institution: str | None) -> tuple[str, str, list[str]]:
        intent = detect_intent(request.message)
        patients = self.repository.list_patients(effective_institution)
        ranked = prioritize_patients(patients)

        if intent == "count_above_patient":
            patient_id = request.patient_synthetic_id or extract_synthetic_id(request.message)
            if not patient_id:
                return (
                    "Indique un identificador sintético con formato SYN-XXXXXXXX-X.",
                    intent,
                    ["Validación de identificador sintético"],
                )
            match = next((item for item in ranked if item.patient.rut_sintetico == patient_id), None)
            if match is None:
                return "No encontré ese ID sintético en el alcance autorizado.", intent, ["Filtro RBAC"]
            count = match.new_position - 1
            return (
                f"Hay {count} pacientes sintéticos por encima de {patient_id}. "
                f"Su posición propuesta es {match.new_position} y su prioridad es {match.priority_band}.",
                intent,
                match.explanation[:3],
            )

        if intent == "high_risk_count":
            high = [item for item in ranked if item.priority_band in {"Revisión inmediata", "Muy alta", "Alta"}]
            return (
                f"En el alcance autorizado hay {len(high)} pacientes sintéticos de prioridad alta o superior.",
                intent,
                ["Motor de priorización HealthOS", "Datos sintéticos locales"],
            )

        if intent == "patient_explanation":
            patient_id = request.patient_synthetic_id or extract_synthetic_id(request.message)
            if not patient_id:
                return "Seleccione un paciente sintético para explicar su prioridad.", intent, []
            match = next((item for item in ranked if item.patient.rut_sintetico == patient_id), None)
            if match is None:
                return "El paciente no existe en el alcance autorizado.", intent, ["Filtro RBAC"]
            reasons = "; ".join(match.explanation[:4])
            return (
                f"{patient_id} quedó en posición {match.new_position} con score {match.total_score:.2f}. "
                f"Factores visibles: {reasons}.",
                intent,
                match.explanation[:4],
            )

        if intent == "institution_breakdown":
            counts = Counter(patient.institucion_nombre for patient in patients)
            top = counts.most_common(5)
            answer = "Los cinco establecimientos con más registros sintéticos son: " + ", ".join(
                f"{name}: {count}" for name, count in top
            )
            return answer, intent, ["Agregación local sin datos personales"]

        waits = [waiting_days(patient) for patient in patients]
        median_wait = sorted(waits)[len(waits) // 2] if waits else 0
        immediate = sum(item.requires_immediate_review for item in ranked)
        return (
            f"La lista local contiene {len(patients)} pacientes sintéticos; mediana observada de "
            f"{median_wait} días y {immediate} banderas de revisión inmediata. Priorizar reordena; "
            "no disminuye el total.",
            "queue_summary" if intent == "unknown" else intent,
            ["Repositorio sintético local", "Motor de scoring explicable"],
        )


async def optional_llama_rephrase(factual_answer: str) -> str:
    """The LLM may rephrase a finished answer but never receives database access or executes tools."""
    if not settings.local_llm_enabled:
        return factual_answer
    httpx = importlib.import_module("httpx")
    prompt = (
        "Reformula en español claro y breve la siguiente respuesta factual. No agregues datos, "
        "no muestres razonamiento interno y conserva todas las advertencias:\n" + factual_answer
    )
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(
                f"{settings.local_llm_url.rstrip('/')}/completion",
                json={"prompt": prompt, "n_predict": 120, "temperature": 0.1},
            )
            response.raise_for_status()
            content = response.json().get("content", "").strip()
            return content[:1200] or factual_answer
    except (httpx.HTTPError, ValueError):
        return factual_answer


@app.get("/health")
def health() -> dict[str, str | bool]:
    return {
        "status": "ok",
        "service": "separated-chatbots",
        "local_llm_enabled": settings.local_llm_enabled,
    }


@app.post("/api/chat/local-list", response_model=ChatResponse)
async def local_list_chat(
    request: ChatRequest,
    user: Annotated[
        CurrentUser,
        Depends(require_roles(Role.JEFATURA_DM2, Role.MEDICO, Role.ENFERMERIA)),
    ],
    repository: Annotated[SyntheticPatientRepository, Depends(get_repository)],
) -> ChatResponse:
    audit_id = new_audit_id()
    safe_message = redact(request.message)
    if contains_prompt_injection(safe_message):
        return ChatResponse(
            answer="Solicitud bloqueada: contiene instrucciones incompatibles con el alcance local seguro.",
            intent="prompt_injection",
            evidence=["Filtro de prompt injection", "Sin ejecución SQL"],
            blocked=True,
            audit_id=audit_id,
        )

    # Non-head roles are constrained to their assigned institution from the JWT.
    effective_institution = request.institution_id
    if user.role != Role.JEFATURA_DM2:
        effective_institution = user.institution_id

    engine = SafeLocalQueryEngine(repository)
    factual_answer, intent, evidence = engine.answer(request, effective_institution)
    answer = await optional_llama_rephrase(factual_answer)
    return ChatResponse(
        answer=answer,
        intent=intent if intent in ALLOWED_INTENTS else "unknown",
        evidence=evidence,
        audit_id=audit_id,
    )
