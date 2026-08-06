from typing import Dict, Any

def calculate_nt118_score(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculates NT 118 risk score, subscores, and decompensations breakdown.
    Supports both dict keys (snake_case or camelCase) and Pydantic models.
    """
    if hasattr(payload, "model_dump"):
        data = payload.model_dump(by_alias=False)
    elif isinstance(payload, dict):
        data = payload
    else:
        data = dict(payload)

    # Normalize key access
    hba1c = float(data.get("hba1c", 0.0))
    vfg = float(data.get("vfg", 90.0))
    systolic_bp = int(data.get("systolic_bp") if "systolic_bp" in data else data.get("systolicBp", 120))
    diastolic_bp = int(data.get("diastolic_bp") if "diastolic_bp" in data else data.get("diastolicBp", 80))
    has_foot_ulcer = bool(data.get("has_foot_ulcer") if "has_foot_ulcer" in data else data.get("hasFootUlcer", False))
    has_retinopathy = bool(data.get("has_retinopathy") if "has_retinopathy" in data else data.get("hasRetinopathy", False))
    days_in_waiting_list = int(data.get("days_in_waiting_list") if "days_in_waiting_list" in data else data.get("daysInWaitingList", 0))
    age = int(data.get("age", 50))

    decompensations = []

    # C1: Control Glicémico (HbA1c) [0 - 40]
    if hba1c > 11.0:
        c1_score = 40
        decompensations.append({
            "code": "HBA1C_CRITICA",
            "label": "HbA1c > 11.0% Severa",
            "severity": "ALTA",
            "value": f"{hba1c}%"
        })
    elif hba1c >= 10.0:
        c1_score = 30
        decompensations.append({
            "code": "HBA1C_ALTA",
            "label": "HbA1c Descompensada",
            "severity": "MEDIA",
            "value": f"{hba1c}%"
        })
    elif hba1c >= 9.0:
        c1_score = 28
        decompensations.append({
            "code": "HBA1C_ALTA",
            "label": "HbA1c Descompensada",
            "severity": "MEDIA",
            "value": f"{hba1c}%"
        })
    elif hba1c >= 8.0:
        c1_score = 18
    elif hba1c >= 7.0:
        c1_score = 10
    else:
        c1_score = 0

    # C2: Deterioro Renal (VFG) [0 - 30]
    if vfg < 30.0:
        c2_score = 30
        decompensations.append({
            "code": "VFG_CRITICA",
            "label": "Insuficiencia Renal Severa (VFG < 30)",
            "severity": "ALTA",
            "value": f"{vfg} mL/min"
        })
    elif vfg <= 44.0:
        c2_score = 25
        decompensations.append({
            "code": "VFG_DISMINUIDA",
            "label": "Enfermedad Renal Etapa 3b",
            "severity": "MEDIA",
            "value": f"{vfg} mL/min"
        })
    elif vfg <= 59.0:
        c2_score = 15
    elif vfg <= 89.0:
        c2_score = 10
    else:
        c2_score = 0

    c2_score = min(30, c2_score)

    # C3: Complicaciones Vasculares & Presión Arterial [0 - 25]
    c3_raw = 0
    if has_foot_ulcer:
        c3_raw += 20
        decompensations.append({
            "code": "PIE_DIABETICO",
            "label": "Sospecha Ulcera Activa",
            "severity": "ALTA",
            "value": "Grado 2"
        })

    if has_retinopathy:
        c3_raw += 15
        decompensations.append({
            "code": "RETINOPATIA",
            "label": "Retinopatía Diabética Proliferativa",
            "severity": "MEDIA",
            "value": "Confirmado"
        })

    if systolic_bp >= 160 or diastolic_bp >= 100:
        c3_raw += 10
        decompensations.append({
            "code": "HTA_SEVERA",
            "label": "Hipertensión Severa",
            "severity": "MEDIA",
            "value": f"{systolic_bp}/{diastolic_bp} mmHg"
        })
    elif systolic_bp >= 140 or diastolic_bp >= 90:
        c3_raw += 5

    c3_score = min(25, c3_raw)

    # C4: Determinantes Sociales [0 - 10]
    c4_raw = 0
    if age > 65:
        c4_raw += 4
    c4_score = min(10, c4_raw)

    # C5: Días en Lista de Espera [0 - 10]
    if days_in_waiting_list > 180:
        c5_score = 10
    elif days_in_waiting_list > 120:
        c5_score = 7
    elif days_in_waiting_list > 90:
        c5_score = 5
    elif days_in_waiting_list > 45:
        c5_score = 3
    else:
        c5_score = 0

    c5_score = min(10, c5_score)

    total_score = min(100, c1_score + c2_score + c3_score + c4_score + c5_score)

    if total_score >= 90:
        risk_level = "CRITICO"
    elif total_score >= 75:
        risk_level = "ALTO"
    elif total_score >= 50:
        risk_level = "MEDIO"
    else:
        risk_level = "BAJO"

    subscores = {
        "c1_hba1c_score": c1_score,
        "c1Hba1cScore": c1_score,
        "c2_renals_score": c2_score,
        "c2RenalsScore": c2_score,
        "c3_cv_score": c3_score,
        "c3CvScore": c3_score,
        "c4_social_score": c4_score,
        "c4SocialScore": c4_score,
        "c5_days_score": c5_score,
        "c5DaysScore": c5_score,
    }

    return {
        "total_score": total_score,
        "totalScore": total_score,
        "risk_level": risk_level,
        "riskLevel": risk_level,
        "subscores": subscores,
        "decompensations": decompensations
    }
