from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional

def to_camel(string: str) -> str:
    components = string.split('_')
    return components[0] + ''.join(x.title() for x in components[1:])

class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        serialize_by_alias=True
    )

class DecompensationFactor(CamelModel):
    code: str
    label: str
    severity: str  # "ALTA" | "MEDIA" | "LEVE"
    value: str

class SubscoresBreakdown(CamelModel):
    c1_hba1c_score: int
    c2_renals_score: int
    c3_cv_score: int
    c4_social_score: int
    c5_days_score: int = 0

class PriorizacionRequest(CamelModel):
    patient_id: Optional[str] = None
    hba1c: float
    systolic_bp: int
    diastolic_bp: int
    vfg: float
    has_foot_ulcer: bool = False
    has_retinopathy: bool = False
    days_in_waiting_list: int = 0
    age: int = 50
    gender: str = "M"
    sector: Optional[str] = None
    cesfam_name: Optional[str] = None

class PriorizacionResponse(CamelModel):
    total_score: int
    risk_level: str  # "CRITICO" | "ALTO" | "MEDIO" | "BAJO"
    subscores: SubscoresBreakdown
    decompensations: List[DecompensationFactor]
