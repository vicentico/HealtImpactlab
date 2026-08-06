from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Literal
from app.schemas.priorizacion import PriorizacionResponse, CamelModel

class AuditLogEntry(CamelModel):
    id: str
    timestamp: str
    user_name: str
    user_role: str
    action: str
    previous_status: str
    new_status: str
    clinical_note: str

class ContraloriaUpdatePayload(CamelModel):
    new_status: str  # "PENDIENTE" | "APROBADO" | "RECHAZADO" | "DERIVADO" | "REQUIERE_REVISION" | "OBSERVADO"
    clinical_note: str
    physician_name: str
    physician_role: str

class Patient(CamelModel):
    id: str
    rut: str
    rut_hash: Optional[str] = None
    full_name: str
    age: int
    gender: str
    sector: str
    cesfam_name: str
    hba1c: float
    systolic_bp: int
    diastolic_bp: int
    vfg: float
    has_foot_ulcer: bool
    has_retinopathy: bool
    days_in_waiting_list: int
    nt118_risk: PriorizacionResponse
    priority_position: int
    previous_priority_position: int
    contraloria_status: str
    assigned_physician: Optional[str] = None
    last_review_date: Optional[str] = None
    audit_history: List[AuditLogEntry] = Field(default_factory=list)
