from fastapi import APIRouter
from app.schemas.priorizacion import PriorizacionRequest
from app.engine.nt118 import calculate_nt118_score

router = APIRouter(prefix="/api/priorizacion", tags=["priorizacion"])

@router.post("/calcular", response_model=dict)
def calculate_priorizacion(payload: PriorizacionRequest):
    return calculate_nt118_score(payload)
