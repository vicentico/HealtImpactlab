import uuid
import datetime
from fastapi import APIRouter, HTTPException, Query, status
from app.schemas.capacity import CreateReferralPayload
from app.engine.capacity import get_capacity_summary, consume_referral_quota
from app.data.mock_db import get_patient_by_id

router = APIRouter(prefix="/api", tags=["capacidad"])

@router.get("/capacidad")
def get_capacity(cesfam_name: str = Query("CESFAM Carol Urzúa")):
    return get_capacity_summary(cesfam_name=cesfam_name)

@router.post("/derivaciones")
def create_referral(payload: CreateReferralPayload):
    patient = get_patient_by_id(payload.patient_id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID '{payload.patient_id}' not found"
        )

    success = consume_referral_quota(payload.target_specialty, payload.cesfam_name if hasattr(payload, 'cesfam_name') else "CESFAM Carol Urzúa")
    
    # Update patient status
    patient["contraloriaStatus"] = "DERIVADO"
    
    audit_entry = {
        "id": f"AUD-{uuid.uuid4().hex[:6].upper()}",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "userName": payload.referring_physician,
        "user_name": payload.referring_physician,
        "userRole": "Médico Contralor APS",
        "user_role": "Médico Contralor APS",
        "action": "DERIVACION_RED",
        "previousStatus": "PENDIENTE",
        "previous_status": "PENDIENTE",
        "newStatus": "DERIVADO",
        "new_status": "DERIVADO",
        "clinicalNote": f"Derivado a {payload.target_facility} ({payload.target_specialty}): {payload.clinical_reason}",
        "clinical_note": f"Derivado a {payload.target_facility} ({payload.target_specialty}): {payload.clinical_reason}"
    }
    
    if "auditHistory" not in patient:
        patient["auditHistory"] = []
    patient["auditHistory"].append(audit_entry)

    return {
        "status": "success",
        "quota_consumed": success,
        "referral_id": f"REF-{uuid.uuid4().hex[:6].upper()}",
        "patient": patient
    }
