import datetime
import uuid
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.schemas.patient import ContraloriaUpdatePayload
from app.data.mock_db import get_all_patients, get_patient_by_id, format_patient_response

router = APIRouter(prefix="/api/pacientes", tags=["pacientes"])

VALID_STATUSES = {"PENDIENTE", "APROBADO", "RECHAZADO", "DERIVADO", "REQUIERE_REVISION", "OBSERVADO"}

@router.get("", response_model=List[dict])
def list_pacientes(
    sector: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    cesfam_name: Optional[str] = Query(None)
):
    return get_all_patients(
        sector=sector,
        status=status,
        risk_level=risk_level,
        cesfam_name=cesfam_name
    )

@router.patch("/{id}/contraloria", response_model=dict)
def update_contraloria_status(id: str, payload: ContraloriaUpdatePayload):
    new_status = payload.new_status
    if new_status not in VALID_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid contraloria status: '{new_status}'. Must be one of {VALID_STATUSES}"
        )

    patient = get_patient_by_id(id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID '{id}' not found"
        )

    previous_status = patient.get("contraloriaStatus", "PENDIENTE")
    patient["contraloriaStatus"] = new_status

    audit_entry = {
        "id": f"AUD-{uuid.uuid4().hex[:6].upper()}",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "userName": payload.physician_name,
        "user_name": payload.physician_name,
        "userRole": payload.physician_role,
        "user_role": payload.physician_role,
        "action": "STATUS_OVERRIDE",
        "previousStatus": previous_status,
        "previous_status": previous_status,
        "newStatus": new_status,
        "new_status": new_status,
        "clinicalNote": payload.clinical_note,
        "clinical_note": payload.clinical_note,
    }

    if "auditHistory" not in patient:
        patient["auditHistory"] = []
    patient["auditHistory"].append(audit_entry)

    return format_patient_response(patient)
