from __future__ import annotations

import math
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Annotated

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, ORJSONResponse
from fastapi.staticfiles import StaticFiles

from src.backend.ai_models.foot_vision import DiabeticFootVisionWrapper
from src.backend.chatbots.local_chat_safe import local_list_chat
from src.backend.chatbots.public_foot_chat_app import public_foot_chat
from src.backend.epidemiology import national_dm2_waitlist_summary
from src.backend.prioritization_engine import prioritize_patients, queue_metrics
from src.backend.repository import SyntheticPatientRepository
from src.backend.schemas import (
    CapacitySimulationRequest,
    ChatRequest,
    ChatResponse,
    FootClassifyRequest,
    FootClassifyResponse,
    PrioritizeRequest,
    PrioritizeResponse,
    ReprioritizeRequest,
    LoginRequest,
    Role,
)
from src.backend.security.auth import (
    CurrentUser,
    authenticate_demo_user,
    create_demo_token,
    get_current_user,
    require_roles,
)
from src.backend.security.middleware import LocalRateLimitMiddleware, SecurityHeadersMiddleware


def runtime_path(relative: str) -> Path:
    base = Path(getattr(sys, "_MEIPASS", Path(__file__).resolve().parents[2]))
    return base / relative


dataset_path = Path(
    os.getenv("HEALTHOS_DATASET_PATH", str(runtime_path("src/data/output/patients_dm2_synthetic.csv")))
)
frontend_dist = Path(os.getenv("HEALTHOS_FRONTEND_DIST", str(runtime_path("src/desktop_web"))))
repository = SyntheticPatientRepository(dataset_path)
vision_model = DiabeticFootVisionWrapper(os.getenv("HEALTHOS_MODEL_PATH", ""))
manual_priority_overrides: dict[str, dict[str, str]] = {}

app = FastAPI(
    title="HealthOS DM2 Prioriza",
    version="1.0.0-demo",
    default_response_class=ORJSONResponse,
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(LocalRateLimitMiddleware, requests_per_minute=240)
from src.backend.config import get_settings

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origin_list,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "healthos-desktop",
        "dataset": "synthetic",
        "vision_mode": vision_model.mode,
    }


@app.get("/api/config")
def edition_config() -> dict[str, str]:
    edition = os.getenv("HEALTHOS_EDITION", "hospital_operaciones")
    if edition == "cesfam_contralor":
        return {
            "edition": edition,
            "product_name": "HealthOS CESFAM Contralor",
            "headline": "Centro de control de derivaciones APS",
            "subtitle": "Cumplimiento, trazabilidad y priorización para reducir espera evitable.",
        }
    return {
        "edition": edition,
        "product_name": "HealthOS Hospital Operaciones",
        "headline": "Torre de control hospitalaria DM2",
        "subtitle": "Prioriza riesgo, coordina equipos y transforma trabajo manual en capacidad accionable.",
    }


@app.get("/api/epidemiology/summary")
def epidemiology_summary() -> dict[str, object]:
    return national_dm2_waitlist_summary()


@app.get("/api/license")
def license_notice() -> dict[str, str]:
    return {
        "owner": "Health Solutions",
        "name": "Licencia propietaria exclusiva HealthOS",
        "copyright": "Copyright © 2026 Health Solutions. Todos los derechos reservados.",
        "scope": "Uso, copia, distribución o comercialización requieren autorización escrita.",
        "program_context": "Desarrollado por Health Solutions en el contexto de Claude Impact Lab 2026.",
        "clinical_notice": "Demostración con datos sintéticos; no constituye diagnóstico ni dispositivo médico.",
    }


@app.post("/api/auth/demo-token")
def demo_token(role: Role, institution_id: str | None = "INST-001") -> dict[str, str]:
    return {
        "access_token": create_demo_token(f"demo-{role.value}", role, institution_id),
        "token_type": "bearer",
        "role": role.value,
    }


@app.post("/api/auth/login")
def login(request: LoginRequest) -> dict[str, str]:
    account = authenticate_demo_user(request.username.strip(), request.password)
    if account is None:
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
    role, display_name, institution_id = account
    return {
        "access_token": create_demo_token(
            request.username.strip(), role, institution_id, display_name, request.edition
        ),
        "token_type": "bearer",
        "role": role.value,
        "display_name": display_name,
        "institution_id": institution_id,
        "edition": request.edition,
    }


@app.get("/api/auth/me")
def session_profile(user: Annotated[CurrentUser, Depends(get_current_user)]) -> dict[str, str | None]:
    return user.model_dump()


@app.post("/api/prioritize", response_model=PrioritizeResponse)
def prioritize(
    request: PrioritizeRequest,
    user: Annotated[CurrentUser, Depends(get_current_user)],
) -> PrioritizeResponse:
    institution_id = request.institution_id
    if user.role != Role.JEFATURA_DM2:
        institution_id = user.institution_id
    ranked = prioritize_patients(
        repository.list_patients(institution_id), request.risk_weight, request.waiting_weight
    )
    priority_order = {"Revisión inmediata": 0, "Muy alta": 1, "Alta": 2, "Media": 3, "Programada": 4}
    for item in ranked:
        override = manual_priority_overrides.get(item.patient.rut_sintetico)
        if override:
            item.priority_band = override["priority_band"]
            item.explanation.insert(0, f"Repriorización profesional: {override['justification']}")
    ranked.sort(key=lambda item: (priority_order.get(item.priority_band, 9), -item.total_score))
    for position, item in enumerate(ranked, 1):
        item.new_position = position
        item.movement = item.previous_position - position
    return PrioritizeResponse(
        generated_at=datetime.now(timezone.utc),
        distinction=(
            "Priorizar redistribuye los cupos hacia mayor riesgo y antigüedad; "
            "aumentar capacidad es lo que reduce la espera global estimada."
        ),
        total_candidates=len(ranked),
        patients=ranked[: request.limit],
        metrics=queue_metrics(ranked),
    )


@app.post("/api/simulate_capacity")
def simulate_capacity(
    request: CapacitySimulationRequest,
    user: Annotated[CurrentUser, Depends(require_roles(Role.JEFATURA_DM2))],
) -> dict[str, object]:
    full_queue = repository.count_by_institution(request.institution_id)
    queue_share = {"consulta_box": .58, "control": .24, "procedimiento": .10, "cirugia_pabellon": .08}[request.care_mode]
    queue_size = max(1, round(full_queue * queue_share))
    current_effective_units = min(request.current_units, request.support_staff_current or request.current_units)
    scenario_effective_units = min(
        request.current_units + request.additional_units,
        (request.support_staff_current + request.support_staff_additional)
        or (request.current_units + request.additional_units),
    )

    def weekly_capacity(units: int) -> int:
        minutes = units * request.shifts_per_day * request.hours_per_shift * 60 * request.workdays_per_week
        return max(1, round((minutes / request.average_case_minutes) * request.utilization_rate))

    baseline = weekly_capacity(current_effective_units)
    scenario = weekly_capacity(scenario_effective_units)

    def estimate(capacity: int) -> float:
        net = capacity - request.weekly_new_entries
        return math.inf if net <= 0 else round((queue_size / net) * 7, 1)

    before, after = estimate(baseline), estimate(scenario)
    reduction = (
        round((before - after) / before * 100, 1)
        if math.isfinite(before) and math.isfinite(after) and before > 0
        else 0.0
    )
    return {
        "queue_size": queue_size,
        "care_mode": request.care_mode,
        "additional_doctors": request.additional_doctors,
        "effective_units_before": current_effective_units,
        "effective_units_after": scenario_effective_units,
        "bottleneck": "personal de apoyo" if scenario_effective_units < request.current_units + request.additional_units else "capacidad física/agenda",
        "shifts_per_day": request.shifts_per_day,
        "baseline_weekly_capacity": baseline,
        "scenario_weekly_capacity": scenario,
        "estimated_global_wait_days_before": before if math.isfinite(before) else "creciente/sin equilibrio",
        "estimated_global_wait_days_after": after if math.isfinite(after) else "creciente/sin equilibrio",
        "estimated_reduction_percent": reduction,
        "recoverable_slots_per_week": max(0, scenario - baseline),
        "projected_attention_days": {
            "prioridad_inmediata": round(max(1, queue_size * .03 / scenario) * 7, 1),
            "prioridad_alta": round(max(1, queue_size * .18 / scenario) * 7, 1),
            "prioridad_media": round(max(1, queue_size * .39 / scenario) * 7, 1),
            "programada": round(max(1, queue_size * .40 / scenario) * 7, 1),
        },
        "interpretation": "Simulación operacional; no constituye un pronóstico hospitalario validado.",
    }


@app.post("/api/reprioritize")
def reprioritize(
    request: ReprioritizeRequest,
    user: Annotated[
        CurrentUser,
        Depends(require_roles(Role.JEFATURA_DM2, Role.MEDICO, Role.ENFERMERIA)),
    ],
) -> dict[str, str]:
    manual_priority_overrides[request.patient_synthetic_id] = {
        "priority_band": request.priority_band,
        "justification": request.justification.strip(),
        "professional": user.display_name,
        "role": user.role.value,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    return {"status": "recorded", **manual_priority_overrides[request.patient_synthetic_id]}


@app.post("/api/diabetic_foot/classify", response_model=FootClassifyResponse)
def classify_foot(
    request: FootClassifyRequest,
    _user: Annotated[
        CurrentUser,
        Depends(require_roles(Role.JEFATURA_DM2, Role.MEDICO, Role.ENFERMERIA)),
    ],
) -> FootClassifyResponse:
    try:
        return vision_model.classify_url(request.synthetic_image_url)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.post("/api/diabetic_foot/analyze-upload")
async def analyze_foot_upload(
    _user: Annotated[
        CurrentUser,
        Depends(require_roles(Role.JEFATURA_DM2, Role.MEDICO, Role.ENFERMERIA)),
    ],
    image: UploadFile = File(...),
) -> dict[str, object]:
    if image.content_type not in {"image/jpeg", "image/png"}:
        raise HTTPException(status_code=415, detail="Solo se aceptan imágenes JPEG o PNG")
    content = await image.read(8 * 1024 * 1024 + 1)
    if len(content) > 8 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="La imagen supera el límite de 8 MB")
    try:
        return vision_model.analyze_image_bytes(content)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.post("/api/chat/local-list", response_model=ChatResponse)
async def local_chat(
    request: ChatRequest,
    user: Annotated[
        CurrentUser,
        Depends(require_roles(Role.JEFATURA_DM2, Role.MEDICO, Role.ENFERMERIA)),
    ],
) -> ChatResponse:
    return await local_list_chat(request, user, repository)


@app.post("/api/chat/public-foot", response_model=ChatResponse)
def public_chat(request: ChatRequest) -> ChatResponse:
    return public_foot_chat(request)


if frontend_dist.exists():
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    def spa(full_path: str):
        candidate = (frontend_dist / full_path).resolve()
        if candidate.is_file() and frontend_dist.resolve() in candidate.parents:
            return FileResponse(candidate)
        return FileResponse(frontend_dist / "index.html")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=int(os.getenv("HEALTHOS_PORT", "8765")))
