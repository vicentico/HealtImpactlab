from pydantic import BaseModel, Field
from typing import List, Optional
from app.schemas.priorizacion import CamelModel

class BoxCapacity(CamelModel):
    id: str
    cesfam_name: str
    box_number: int
    box_type: str  # "MEDICO" | "ENFERMERA" | "MULTIDISCIPLINARIO"
    is_active: bool
    weekly_hours_capacity: int
    current_weekly_occupancy: int

class ReferralQuota(CamelModel):
    id: str
    cesfam_name: str
    hospital_target: str
    specialty: str  # "DIABETOLOGIA" | "NEFROLOGIA" | "PIE_DIABETICO"
    monthly_quota_limit: int
    monthly_quota_used: int
    valid_month: str

class CapacitySummaryResponse(CamelModel):
    total_boxes: int
    active_boxes: int
    total_weekly_hours: int
    occupied_weekly_hours: int
    box_utilization_rate: float
    referral_quotas: List[ReferralQuota]

class CreateReferralPayload(CamelModel):
    patient_id: str
    target_facility: str
    target_specialty: str
    clinical_reason: str
    referring_physician: str
