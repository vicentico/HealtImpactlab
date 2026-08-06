from typing import List, Dict, Any
from app.schemas.capacity import BoxCapacity, ReferralQuota, CapacitySummaryResponse

# Datos Sintéticos Iniciales de Capacidad de Planta (CESFAM Carol Urzúa & Red)
INITIAL_BOXES: List[Dict[str, Any]] = [
    {"id": "BOX-101", "cesfamName": "CESFAM Carol Urzúa", "boxNumber": 1, "boxType": "MEDICO", "isActive": True, "weeklyHoursCapacity": 44, "currentWeeklyOccupancy": 36},
    {"id": "BOX-102", "cesfamName": "CESFAM Carol Urzúa", "boxNumber": 2, "boxType": "MEDICO", "isActive": True, "weeklyHoursCapacity": 44, "currentWeeklyOccupancy": 40},
    {"id": "BOX-103", "cesfamName": "CESFAM Carol Urzúa", "boxNumber": 3, "boxType": "ENFERMERA", "isActive": True, "weeklyHoursCapacity": 44, "currentWeeklyOccupancy": 30},
    {"id": "BOX-104", "cesfamName": "CESFAM Carol Urzúa", "boxNumber": 4, "boxType": "MULTIDISCIPLINARIO", "isActive": True, "weeklyHoursCapacity": 44, "currentWeeklyOccupancy": 42},
    {"id": "BOX-105", "cesfamName": "CESFAM Carol Urzúa", "boxNumber": 5, "boxType": "MEDICO", "isActive": False, "weeklyHoursCapacity": 44, "currentWeeklyOccupancy": 0},
]

INITIAL_QUOTAS: List[Dict[str, Any]] = [
    {"id": "QUOTA-01", "cesfamName": "CESFAM Carol Urzúa", "hospitalTarget": "Hospital San Borja Arriarán", "specialty": "DIABETOLOGIA", "monthlyQuotaLimit": 15, "monthlyQuotaUsed": 11, "validMonth": "2026-08"},
    {"id": "QUOTA-02", "cesfamName": "CESFAM Carol Urzúa", "hospitalTarget": "Hospital San Borja Arriarán", "specialty": "NEFROLOGIA", "monthlyQuotaLimit": 8, "monthlyQuotaUsed": 6, "validMonth": "2026-08"},
    {"id": "QUOTA-03", "cesfamName": "CESFAM Carol Urzúa", "hospitalTarget": "Hospital Barros Lucco (HBLT)", "specialty": "PIE_DIABETICO", "monthlyQuotaLimit": 6, "monthlyQuotaUsed": 5, "validMonth": "2026-08"},
]

def get_capacity_summary(cesfam_name: str = "CESFAM Carol Urzúa") -> Dict[str, Any]:
    relevant_boxes = [b for b in INITIAL_BOXES if b["cesfamName"] == cesfam_name]
    total_boxes = len(relevant_boxes)
    active_boxes = len([b for b in relevant_boxes if b["isActive"]])
    
    total_hours = sum(b["weeklyHoursCapacity"] for b in relevant_boxes if b["isActive"])
    occupied_hours = sum(b["currentWeeklyOccupancy"] for b in relevant_boxes if b["isActive"])
    
    utilization_rate = round((occupied_hours / total_hours * 100), 1) if total_hours > 0 else 0.0
    
    relevant_quotas = [q for q in INITIAL_QUOTAS if q["cesfamName"] == cesfam_name]
    
    return {
        "totalBoxes": total_boxes,
        "activeBoxes": active_boxes,
        "totalWeeklyHours": total_hours,
        "occupiedWeeklyHours": occupied_hours,
        "boxUtilizationRate": utilization_rate,
        "referralQuotas": relevant_quotas,
        "boxes": relevant_boxes
    }

def consume_referral_quota(specialty: str, cesfam_name: str = "CESFAM Carol Urzúa") -> bool:
    for quota in INITIAL_QUOTAS:
        if quota["cesfamName"] == cesfam_name and quota["specialty"] == specialty:
            if quota["monthlyQuotaUsed"] < quota["monthlyQuotaLimit"]:
                quota["monthlyQuotaUsed"] += 1
                return True
            return False
    return True
