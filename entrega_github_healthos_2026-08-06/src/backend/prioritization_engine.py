from __future__ import annotations

import math
from datetime import date, datetime, timezone
from statistics import median
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException

from src.backend.repository import SyntheticPatientRepository, get_repository
from src.backend.schemas import (
    CapacitySimulationRequest,
    PatientRecord,
    PrioritizedPatient,
    PrioritizeRequest,
    PrioritizeResponse,
    Role,
)
from src.backend.security.auth import CurrentUser, require_roles
from src.backend.security.middleware import LocalRateLimitMiddleware, SecurityHeadersMiddleware

app = FastAPI(
    title="HealthOS DM2 Prioriza - Motor de Priorización",
    version="0.1.0",
    description=(
        "Motor demostrativo con datos sintéticos. Reordenar la lista no equivale a reducirla; "
        "la simulación de capacidad modela el segundo efecto por separado."
    ),
)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(LocalRateLimitMiddleware, requests_per_minute=180)

COMORBIDITY_WEIGHTS = {
    "Enfermedad Renal Crónica": 0.23,
    "Enfermedad Cardiovascular": 0.18,
    "Neuropatía": 0.13,
    "Retinopatía": 0.12,
    "Hipertensión": 0.07,
    "Obesidad": 0.06,
    "Dislipidemia": 0.04,
}


def clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(high, value))


def waiting_days(patient: PatientRecord, today: date | None = None) -> int:
    today = today or date.today()
    return max(0, (today - patient.fecha_inscripcion_lista).days)


def recency_days(patient: PatientRecord, today: date | None = None) -> int:
    today = today or date.today()
    return max(0, (today - patient.ultima_visita_hospital_sintetica).days)


def calculate_waiting_score(days: int, normalization_days: int = 730) -> float:
    """Log scaling protects old cases without letting antiquity dominate all clinical risk."""
    return clamp(math.log1p(days) / math.log1p(normalization_days))


def calculate_clinical_risk(patient: PatientRecord) -> tuple[float, list[str], bool]:
    explanations: list[str] = []

    hba1c_score = clamp((patient.synthetic_hba1c - 7.0) / 5.0)
    if patient.synthetic_hba1c > 10.0:
        explanations.append(f"HbA1c sintética muy elevada ({patient.synthetic_hba1c:.1f}%)")
    elif patient.synthetic_hba1c > 9.0:
        explanations.append(f"HbA1c sintética elevada ({patient.synthetic_hba1c:.1f}%)")

    comorbidity_score = clamp(
        sum(COMORBIDITY_WEIGHTS.get(item, 0.03) for item in patient.comorbilidades_sinteticas)
    )
    high_impact = [
        item
        for item in patient.comorbilidades_sinteticas
        if item in {"Enfermedad Renal Crónica", "Enfermedad Cardiovascular", "Neuropatía"}
    ]
    if high_impact:
        explanations.append("Comorbilidades de mayor impacto: " + ", ".join(high_impact))

    ecicep_score = {"G1": 0.25, "G2": 0.60, "G3": 1.0}[patient.estrato_ecicep_sintetico]
    if patient.estrato_ecicep_sintetico == "G3":
        explanations.append("Estrato ECICEP sintético G3 por multimorbilidad")

    foot_score = clamp(
        0.55 * patient.riesgo_pie_diabetico_sintetico + 0.45 * (patient.wagner_sintetico / 5)
    )
    if patient.wagner_sintetico >= 3:
        explanations.append(
            f"Visión artificial sintética sugiere Wagner {patient.wagner_sintetico}"
        )
    elif patient.wagner_sintetico >= 1:
        explanations.append(
            f"Riesgo sintético de pie diabético con Wagner {patient.wagner_sintetico}"
        )

    hypoglycemia_score = patient.riesgo_hipoglicemia_sintetico
    if hypoglycemia_score >= 0.75:
        explanations.append("Riesgo sintético alto de hipoglicemia")

    last_visit_days = recency_days(patient)
    continuity_score = clamp(last_visit_days / 365)
    if last_visit_days > 180:
        explanations.append(f"Última visita sintética hace {last_visit_days} días")

    # Age is only a mild vulnerability term; it never lowers a patient's priority.
    age_vulnerability = clamp((patient.edad - 55) / 35) if patient.edad >= 55 else 0.0
    if patient.edad >= 75:
        explanations.append("Mayor vulnerabilidad por edad avanzada (factor secundario)")

    score = clamp(
        0.29 * hba1c_score
        + 0.18 * comorbidity_score
        + 0.08 * ecicep_score
        + 0.25 * foot_score
        + 0.10 * hypoglycemia_score
        + 0.07 * continuity_score
        + 0.03 * age_vulnerability
    )

    immediate_review = (
        patient.wagner_sintetico >= 4
        or (patient.wagner_sintetico >= 3 and patient.riesgo_pie_diabetico_sintetico >= 0.8)
        or (patient.synthetic_hba1c >= 12.0 and hypoglycemia_score >= 0.8)
    )
    if immediate_review:
        explanations.insert(0, "Bandera de revisión profesional inmediata")

    if not explanations:
        explanations.append("Sin banderas sintéticas críticas; se conserva antigüedad como criterio")
    return score, explanations, immediate_review


def priority_band(total_score: float, immediate_review: bool) -> str:
    if immediate_review:
        return "Revisión inmediata"
    if total_score >= 0.78:
        return "Muy alta"
    if total_score >= 0.62:
        return "Alta"
    if total_score >= 0.42:
        return "Media"
    return "Programada"


def prioritize_patients(
    patients: list[PatientRecord],
    risk_weight: float = 0.72,
    waiting_weight: float = 0.28,
) -> list[PrioritizedPatient]:
    original = sorted(
        patients,
        key=lambda patient: (patient.fecha_inscripcion_lista, patient.rut_sintetico),
    )
    previous_positions = {patient.rut_sintetico: index for index, patient in enumerate(original, 1)}

    scored: list[tuple[PatientRecord, float, float, float, list[str], bool]] = []
    for patient in patients:
        days = waiting_days(patient)
        wait_score = calculate_waiting_score(days)
        clinical_score, reasons, immediate = calculate_clinical_risk(patient)
        total = clamp(risk_weight * clinical_score + waiting_weight * wait_score)
        if days >= 300:
            reasons.append(f"Antigüedad prolongada: {days} días en lista")
        scored.append((patient, clinical_score, wait_score, total, reasons, immediate))

    scored.sort(
        key=lambda item: (
            not item[5],            # Immediate review first.
            -item[3],               # Higher combined score.
            item[0].fecha_inscripcion_lista,
            item[0].rut_sintetico,
        )
    )

    result: list[PrioritizedPatient] = []
    for new_position, (patient, clinical, waiting, total, reasons, immediate) in enumerate(scored, 1):
        old = previous_positions[patient.rut_sintetico]
        movement = old - new_position
        if movement > 0:
            reasons.append(f"Sube {movement} posiciones por riesgo + antigüedad")
        elif movement < 0:
            reasons.append(
                "Baja en la cola relativa porque otros casos presentan mayor riesgo; conserva trazabilidad"
            )
        result.append(
            PrioritizedPatient(
                patient=patient,
                previous_position=old,
                new_position=new_position,
                movement=movement,
                clinical_risk_score=round(clinical, 4),
                waiting_score=round(waiting, 4),
                total_score=round(total, 4),
                priority_band=priority_band(total, immediate),
                explanation=reasons,
                requires_immediate_review=immediate,
            )
        )
    return result


def queue_metrics(prioritized: list[PrioritizedPatient]) -> dict[str, float | int | str]:
    high = [item for item in prioritized if item.priority_band in {"Revisión inmediata", "Muy alta", "Alta"}]
    waits = [waiting_days(item.patient) for item in prioritized]
    return {
        "queue_size_unchanged": len(prioritized),
        "immediate_review": sum(item.requires_immediate_review for item in prioritized),
        "high_priority": len(high),
        "median_waiting_days_observed": round(median(waits), 1) if waits else 0.0,
        "message": "La priorización cambia el orden, no el número total de personas en espera.",
    }


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "prioritization"}


@app.post("/api/prioritize", response_model=PrioritizeResponse)
def prioritize(
    request: PrioritizeRequest,
    repository: Annotated[SyntheticPatientRepository, Depends(get_repository)],
    _user: Annotated[
        CurrentUser,
        Depends(require_roles(Role.JEFATURA_DM2, Role.MEDICO, Role.ENFERMERIA)),
    ],
) -> PrioritizeResponse:
    try:
        candidates = repository.list_patients(request.institution_id)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    ranked = prioritize_patients(candidates, request.risk_weight, request.waiting_weight)
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
    repository: Annotated[SyntheticPatientRepository, Depends(get_repository)],
    _user: Annotated[CurrentUser, Depends(require_roles(Role.JEFATURA_DM2))],
) -> dict[str, float | int | str]:
    queue_size = repository.count_by_institution(request.institution_id)
    baseline_weekly_capacity = (
        request.current_doctors
        * request.appointments_per_doctor_per_day
        * request.workdays_per_week
    )
    scenario_weekly_capacity = (
        (request.current_doctors + request.additional_doctors)
        * request.appointments_per_doctor_per_day
        * request.workdays_per_week
    )

    def estimate_wait(capacity: int) -> float:
        net_capacity = capacity - request.weekly_new_entries
        if net_capacity <= 0:
            return math.inf
        return round((queue_size / net_capacity) * 7, 1)

    before = estimate_wait(baseline_weekly_capacity)
    after = estimate_wait(scenario_weekly_capacity)
    reduction = 0.0
    if math.isfinite(before) and math.isfinite(after) and before > 0:
        reduction = round((before - after) / before * 100, 1)

    return {
        "queue_size": queue_size,
        "additional_doctors": request.additional_doctors,
        "baseline_weekly_capacity": baseline_weekly_capacity,
        "scenario_weekly_capacity": scenario_weekly_capacity,
        "estimated_global_wait_days_before": before if math.isfinite(before) else "creciente/sin equilibrio",
        "estimated_global_wait_days_after": after if math.isfinite(after) else "creciente/sin equilibrio",
        "estimated_reduction_percent": reduction,
        "interpretation": (
            "El orden clínico puede mantenerse, pero el tiempo global baja solo cuando la capacidad neta "
            "supera las nuevas entradas. Resultado de simulación, no pronóstico hospitalario validado."
        ),
    }
