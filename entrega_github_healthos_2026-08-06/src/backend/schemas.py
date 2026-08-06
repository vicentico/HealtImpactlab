from __future__ import annotations

from datetime import date, datetime
from enum import StrEnum
from typing import Any, Literal

from pydantic import BaseModel, Field, HttpUrl, field_validator


class Role(StrEnum):
    JEFATURA_DM2 = "jefatura_dm2"
    MEDICO = "medico"
    ENFERMERIA = "enfermeria"


class LoginRequest(BaseModel):
    username: str = Field(min_length=3, max_length=80)
    password: str = Field(min_length=8, max_length=160)
    edition: Literal["cesfam_contralor", "hospital_operaciones"] = "hospital_operaciones"


class DataClassification(StrEnum):
    PUBLIC = "PUBLIC"
    SYNTHETIC_OPERATIONAL = "SYNTHETIC_OPERATIONAL"
    LOCAL_CLINICAL = "LOCAL_CLINICAL"
    RESTRICTED_SECURITY = "RESTRICTED_SECURITY"


class PatientRecord(BaseModel):
    rut_sintetico: str
    nombre_sintetico: str
    edad: int = Field(ge=18, le=110)
    sexo_sintetico: str
    fecha_inscripcion_lista: date
    synthetic_hba1c: float = Field(ge=4.0, le=20.0)
    comorbilidades_sinteticas: list[str] = Field(default_factory=list)
    estrato_ecicep_sintetico: str = Field(pattern=r"^G[1-3]$")
    ultima_visita_hospital_sintetica: date
    institucion_id: str
    institucion_nombre: str
    region: str
    ubicacion_sintetica_pie_diabetico_imageurl: str
    riesgo_pie_diabetico_sintetico: float = Field(ge=0.0, le=1.0)
    wagner_sintetico: int = Field(ge=0, le=5)
    riesgo_hipoglicemia_sintetico: float = Field(ge=0.0, le=1.0)
    no_show_risk_sintetico: float = Field(ge=0.0, le=1.0)
    route_sugerida: str

    @field_validator("rut_sintetico")
    @classmethod
    def require_synthetic_prefix(cls, value: str) -> str:
        if not value.startswith("SYN-"):
            raise ValueError("Los identificadores del MVP deben comenzar con SYN-")
        return value


class PrioritizeRequest(BaseModel):
    institution_id: str | None = None
    limit: int = Field(default=100, ge=1, le=1000)
    risk_weight: float = Field(default=0.72, ge=0.51, le=0.95)
    waiting_weight: float = Field(default=0.28, ge=0.05, le=0.49)
    include_explanations: bool = True

    @field_validator("waiting_weight")
    @classmethod
    def weights_are_valid(cls, value: float, info: Any) -> float:
        risk_weight = info.data.get("risk_weight", 0.72)
        if abs((risk_weight + value) - 1.0) > 1e-6:
            raise ValueError("risk_weight + waiting_weight debe ser 1.0")
        return value


class PrioritizedPatient(BaseModel):
    patient: PatientRecord
    previous_position: int
    new_position: int
    movement: int
    clinical_risk_score: float
    waiting_score: float
    total_score: float
    priority_band: str
    explanation: list[str]
    requires_immediate_review: bool


class PrioritizeResponse(BaseModel):
    generated_at: datetime
    distinction: str
    total_candidates: int
    patients: list[PrioritizedPatient]
    metrics: dict[str, float | int | str]


class CapacitySimulationRequest(BaseModel):
    institution_id: str | None = None
    current_doctors: int = Field(default=5, ge=1, le=500)
    additional_doctors: int = Field(default=0, ge=0, le=500)
    appointments_per_doctor_per_day: int = Field(default=12, ge=1, le=40)
    workdays_per_week: int = Field(default=5, ge=1, le=7)
    weekly_new_entries: int = Field(default=100, ge=0, le=100_000)
    care_mode: Literal["consulta_box", "cirugia_pabellon", "procedimiento", "control"] = "consulta_box"
    current_units: int = Field(default=5, ge=1, le=500)
    additional_units: int = Field(default=0, ge=0, le=500)
    support_staff_current: int = Field(default=5, ge=0, le=500)
    support_staff_additional: int = Field(default=0, ge=0, le=500)
    shifts_per_day: int = Field(default=1, ge=1, le=3)
    hours_per_shift: float = Field(default=8, ge=1, le=24)
    average_case_minutes: int = Field(default=30, ge=10, le=720)
    utilization_rate: float = Field(default=0.82, ge=0.2, le=1.0)


class FootClassifyRequest(BaseModel):
    synthetic_image_url: str = Field(min_length=5, max_length=500)
    patient_synthetic_id: str | None = Field(default=None, max_length=64)


class FootClassifyResponse(BaseModel):
    synthetic_stage: int
    synthetic_probability: float
    infection_risk: str
    prioritization_suggestion: str
    model_mode: str
    disclaimer: str
    explainability: dict[str, float | str]


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=700)
    institution_id: str | None = Field(default=None, max_length=50)
    patient_synthetic_id: str | None = Field(default=None, max_length=64)
    role: Role


class ChatResponse(BaseModel):
    answer: str
    intent: str
    evidence: list[str]
    blocked: bool = False
    audit_id: str


class ReprioritizeRequest(BaseModel):
    patient_synthetic_id: str = Field(pattern=r"^SYN-")
    priority_band: Literal["Revisión inmediata", "Muy alta", "Alta", "Media", "Programada"]
    justification: str = Field(min_length=12, max_length=600)
