import copy
from typing import List, Dict, Any, Optional
from app.core.privacy import mask_rut, hash_rut
from app.engine.nt118 import calculate_nt118_score

def get_initial_mock_patients() -> List[Dict[str, Any]]:
    return [
        {
            "id": "PAT-001",
            "rut": "12.458.930-K",
            "fullName": "Carmen Rosa Morales Fuentes",
            "age": 67,
            "gender": "F",
            "sector": "SECTOR_ROJO",
            "cesfamName": "CESFAM Carol Urzúa",
            "hba1c": 11.4,
            "systolicBp": 165,
            "diastolicBp": 98,
            "vfg": 42.0,
            "hasFootUlcer": True,
            "hasRetinopathy": True,
            "daysInWaitingList": 142,
            "priorityPosition": 1,
            "previousPriorityPosition": 1,
            "contraloriaStatus": "PENDIENTE",
            "assignedPhysician": "Dr. Alejandro Silva",
            "lastReviewDate": "2026-08-01",
            "auditHistory": [
                {
                    "id": "AUD-001",
                    "timestamp": "2026-08-01T10:00:00Z",
                    "userName": "Sistema APS Integration",
                    "userRole": "Sistema Auto",
                    "action": "CREATION",
                    "previousStatus": "PENDIENTE",
                    "newStatus": "PENDIENTE",
                    "clinicalNote": "Ingreso a lista de espera priorizada NT 118"
                }
            ]
        },
        {
            "id": "PAT-003",
            "rut": "9.310.224-8",
            "fullName": "Elena Maria Valenzuela Lopez",
            "age": 74,
            "gender": "F",
            "sector": "SECTOR_VERDE",
            "cesfamName": "CESFAM Dr. Aníbal Ariztía",
            "hba1c": 8.5,
            "systolicBp": 138,
            "diastolicBp": 84,
            "vfg": 32.0,
            "hasFootUlcer": False,
            "hasRetinopathy": False,
            "daysInWaitingList": 215,
            "priorityPosition": 3,
            "previousPriorityPosition": 2,
            "contraloriaStatus": "APROBADO",
            "assignedPhysician": "Dr. Alejandro Silva",
            "lastReviewDate": "2026-08-03",
            "auditHistory": [
                {
                    "id": "AUD-003",
                    "timestamp": "2026-08-03T14:15:00Z",
                    "userName": "Dr. Alejandro Silva",
                    "userRole": "Médico Contralor",
                    "action": "STATUS_OVERRIDE",
                    "previousStatus": "PENDIENTE",
                    "newStatus": "APROBADO",
                    "clinicalNote": "Aprobada derivación prioritaria a especialista"
                }
            ]
        },
        {
            "id": "PAT-002",
            "rut": "14.821.405-3",
            "fullName": "José Manuel Araya Gomez",
            "age": 62,
            "gender": "M",
            "sector": "SECTOR_AZUL",
            "cesfamName": "CESFAM Carol Urzúa",
            "hba1c": 9.8,
            "systolicBp": 152,
            "diastolicBp": 92,
            "vfg": 58.0,
            "hasFootUlcer": False,
            "hasRetinopathy": True,
            "daysInWaitingList": 98,
            "priorityPosition": 2,
            "previousPriorityPosition": 3,
            "contraloriaStatus": "OBSERVADO",
            "assignedPhysician": "Dra. Maria Zuñiga",
            "lastReviewDate": "2026-08-02",
            "auditHistory": [
                {
                    "id": "AUD-002",
                    "timestamp": "2026-08-02T11:30:00Z",
                    "userName": "Dra. Maria Zuñiga",
                    "userRole": "Médico Contralor",
                    "action": "STATUS_OVERRIDE",
                    "previousStatus": "PENDIENTE",
                    "newStatus": "OBSERVADO",
                    "clinicalNote": "Se solicitan exámenes complementarios de proteinuria"
                }
            ]
        },
        {
            "id": "PAT-004",
            "rut": "16.740.119-1",
            "fullName": "Roberto Carlos Figueroa Soto",
            "age": 54,
            "gender": "M",
            "sector": "SECTOR_AMARILLO",
            "cesfamName": "CESFAM Carol Urzúa",
            "hba1c": 7.2,
            "systolicBp": 128,
            "diastolicBp": 82,
            "vfg": 78.0,
            "hasFootUlcer": False,
            "hasRetinopathy": False,
            "daysInWaitingList": 30,
            "priorityPosition": 4,
            "previousPriorityPosition": 4,
            "contraloriaStatus": "PENDIENTE",
            "assignedPhysician": "Dra. Maria Zuñiga",
            "lastReviewDate": "2026-08-04",
            "auditHistory": [
                {
                    "id": "AUD-004",
                    "timestamp": "2026-08-04T09:00:00Z",
                    "userName": "Sistema APS Integration",
                    "userRole": "Sistema Auto",
                    "action": "CREATION",
                    "previousStatus": "PENDIENTE",
                    "newStatus": "PENDIENTE",
                    "clinicalNote": "Ingreso inicial de paciente a monitoreo"
                }
            ]
        },
        {
            "id": "PAT-005",
            "rut": "18.233.910-4",
            "fullName": "Lucia Esperanza Tapia Rios",
            "age": 69,
            "gender": "F",
            "sector": "SECTOR_ROJO",
            "cesfamName": "CESFAM Dr. Aníbal Ariztía",
            "hba1c": 10.2,
            "systolicBp": 158,
            "diastolicBp": 94,
            "vfg": 48.0,
            "hasFootUlcer": False,
            "hasRetinopathy": False,
            "daysInWaitingList": 110,
            "priorityPosition": 5,
            "previousPriorityPosition": 5,
            "contraloriaStatus": "REQUIERE_REVISION",
            "assignedPhysician": "Dr. Alejandro Silva",
            "lastReviewDate": "2026-08-04",
            "auditHistory": [
                {
                    "id": "AUD-005",
                    "timestamp": "2026-08-04T16:45:00Z",
                    "userName": "Dr. Alejandro Silva",
                    "userRole": "Médico Contralor",
                    "action": "STATUS_OVERRIDE",
                    "previousStatus": "PENDIENTE",
                    "newStatus": "REQUIERE_REVISION",
                    "clinicalNote": "Se requiere ajustar dosis de insulinoterapia antes de derivar"
                }
            ]
        },
        {
            "id": "PAT-006",
            "rut": "15.922.314-7",
            "fullName": "Gonzalo Esteban Navarrete Vera",
            "age": 58,
            "gender": "M",
            "sector": "SECTOR_ROJO",
            "cesfamName": "CESFAM Carol Urzúa",
            "hba1c": 11.8,
            "systolicBp": 170,
            "diastolicBp": 102,
            "vfg": 27.0,
            "hasFootUlcer": True,
            "hasRetinopathy": True,
            "daysInWaitingList": 195,
            "priorityPosition": 6,
            "previousPriorityPosition": 6,
            "contraloriaStatus": "DERIVADO",
            "assignedPhysician": "Dr. Alejandro Silva",
            "lastReviewDate": "2026-08-04",
            "auditHistory": [
                {
                    "id": "AUD-006",
                    "timestamp": "2026-08-04T18:00:00Z",
                    "userName": "Dr. Alejandro Silva",
                    "userRole": "Médico Contralor",
                    "action": "STATUS_OVERRIDE",
                    "previousStatus": "PENDIENTE",
                    "newStatus": "DERIVADO",
                    "clinicalNote": "Paciente derivado de urgencia por descompensación renal y vascular"
                }
            ]
        },
        {
            "id": "PAT-007",
            "rut": "11.650.482-9",
            "fullName": "Marta Isabel Sepulveda Bravo",
            "age": 71,
            "gender": "F",
            "sector": "SECTOR_AZUL",
            "cesfamName": "CESFAM Dr. Aníbal Ariztía",
            "hba1c": 9.1,
            "systolicBp": 148,
            "diastolicBp": 88,
            "vfg": 52.0,
            "hasFootUlcer": False,
            "hasRetinopathy": True,
            "daysInWaitingList": 130,
            "priorityPosition": 7,
            "previousPriorityPosition": 7,
            "contraloriaStatus": "RECHAZADO",
            "assignedPhysician": "Dra. Maria Zuñiga",
            "lastReviewDate": "2026-08-04",
            "auditHistory": [
                {
                    "id": "AUD-007",
                    "timestamp": "2026-08-04T19:30:00Z",
                    "userName": "Dra. Maria Zuñiga",
                    "userRole": "Médico Contralor",
                    "action": "STATUS_OVERRIDE",
                    "previousStatus": "PENDIENTE",
                    "newStatus": "RECHAZADO",
                    "clinicalNote": "Rechazada solicitud por falta de criterios de ingreso a nivel secundario"
                }
            ]
        },
        {
            "id": "PAT-008",
            "rut": "13.109.845-2",
            "fullName": "Pedro Antonio Castillo Munoz",
            "age": 66,
            "gender": "M",
            "sector": "SECTOR_VERDE",
            "cesfamName": "CESFAM Carol Urzúa",
            "hba1c": 6.8,
            "systolicBp": 125,
            "diastolicBp": 78,
            "vfg": 92.0,
            "hasFootUlcer": False,
            "hasRetinopathy": False,
            "daysInWaitingList": 85,
            "priorityPosition": 8,
            "previousPriorityPosition": 8,
            "contraloriaStatus": "PENDIENTE",
            "assignedPhysician": "Dr. Alejandro Silva",
            "lastReviewDate": "2026-08-05",
            "auditHistory": [
                {
                    "id": "AUD-008",
                    "timestamp": "2026-08-05T08:30:00Z",
                    "userName": "Sistema APS Integration",
                    "userRole": "Sistema Auto",
                    "action": "CREATION",
                    "previousStatus": "PENDIENTE",
                    "newStatus": "PENDIENTE",
                    "clinicalNote": "Ingreso regular a seguimiento APS"
                }
            ]
        },
        {
            "id": "PAT-009",
            "rut": "17.430.551-K",
            "fullName": "Sofia Francisca Morales Pinto",
            "age": 50,
            "gender": "F",
            "sector": "SECTOR_AMARILLO",
            "cesfamName": "CESFAM Dr. Aníbal Ariztía",
            "hba1c": 8.0,
            "systolicBp": 130,
            "diastolicBp": 80,
            "vfg": 65.0,
            "hasFootUlcer": False,
            "hasRetinopathy": False,
            "daysInWaitingList": 40,
            "priorityPosition": 9,
            "previousPriorityPosition": 9,
            "contraloriaStatus": "APROBADO",
            "assignedPhysician": "Dra. Maria Zuñiga",
            "lastReviewDate": "2026-08-05",
            "auditHistory": [
                {
                    "id": "AUD-009",
                    "timestamp": "2026-08-05T10:15:00Z",
                    "userName": "Dra. Maria Zuñiga",
                    "userRole": "Médico Contralor",
                    "action": "STATUS_OVERRIDE",
                    "previousStatus": "PENDIENTE",
                    "newStatus": "APROBADO",
                    "clinicalNote": "Evaluación aprobada en comité de contraloría"
                }
            ]
        },
        {
            "id": "PAT-010",
            "rut": "10.887.213-4",
            "fullName": "Fernando Javier Paredes Soto",
            "age": 76,
            "gender": "M",
            "sector": "SECTOR_ROJO",
            "cesfamName": "CESFAM Carol Urzúa",
            "hba1c": 10.5,
            "systolicBp": 162,
            "diastolicBp": 96,
            "vfg": 38.0,
            "hasFootUlcer": True,
            "hasRetinopathy": False,
            "daysInWaitingList": 160,
            "priorityPosition": 10,
            "previousPriorityPosition": 10,
            "contraloriaStatus": "DERIVADO",
            "assignedPhysician": "Dr. Alejandro Silva",
            "lastReviewDate": "2026-08-05",
            "auditHistory": [
                {
                    "id": "AUD-010",
                    "timestamp": "2026-08-05T11:45:00Z",
                    "userName": "Dr. Alejandro Silva",
                    "userRole": "Médico Contralor",
                    "action": "STATUS_OVERRIDE",
                    "previousStatus": "PENDIENTE",
                    "newStatus": "DERIVADO",
                    "clinicalNote": "Derivación aceptada a podología y nefrología"
                }
            ]
        }
    ]

_db_patients: List[Dict[str, Any]] = get_initial_mock_patients()

def load_mock_db() -> List[Dict[str, Any]]:
    return copy.deepcopy(get_initial_mock_patients())

def format_patient_response(p: Dict[str, Any]) -> Dict[str, Any]:
    p_copy = copy.deepcopy(p)
    raw_rut = p_copy.get("rut")
    # Mask & Hash RUT
    p_copy["rut"] = mask_rut(raw_rut)
    p_copy["rut_hash"] = hash_rut(raw_rut)
    p_copy["rutHash"] = hash_rut(raw_rut)
    # Compute NT 118 Risk Score
    nt118_risk = calculate_nt118_score(p_copy)
    p_copy["nt118Risk"] = nt118_risk
    p_copy["nt118_risk"] = nt118_risk
    # Ensure snake_case & camelCase key availability
    p_copy["fullName"] = p_copy.get("fullName")
    p_copy["full_name"] = p_copy.get("fullName")
    p_copy["systolicBp"] = p_copy.get("systolicBp")
    p_copy["systolic_bp"] = p_copy.get("systolicBp")
    p_copy["diastolicBp"] = p_copy.get("diastolicBp")
    p_copy["diastolic_bp"] = p_copy.get("diastolicBp")
    p_copy["hasFootUlcer"] = p_copy.get("hasFootUlcer")
    p_copy["has_foot_ulcer"] = p_copy.get("hasFootUlcer")
    p_copy["hasRetinopathy"] = p_copy.get("hasRetinopathy")
    p_copy["has_retinopathy"] = p_copy.get("hasRetinopathy")
    p_copy["daysInWaitingList"] = p_copy.get("daysInWaitingList")
    p_copy["days_in_waiting_list"] = p_copy.get("daysInWaitingList")
    p_copy["cesfamName"] = p_copy.get("cesfamName")
    p_copy["cesfam_name"] = p_copy.get("cesfamName")
    p_copy["priorityPosition"] = p_copy.get("priorityPosition")
    p_copy["priority_position"] = p_copy.get("priorityPosition")
    p_copy["previousPriorityPosition"] = p_copy.get("previousPriorityPosition")
    p_copy["previous_priority_position"] = p_copy.get("previousPriorityPosition")
    p_copy["contraloriaStatus"] = p_copy.get("contraloriaStatus")
    p_copy["contraloria_status"] = p_copy.get("contraloriaStatus")
    p_copy["assignedPhysician"] = p_copy.get("assignedPhysician")
    p_copy["assigned_physician"] = p_copy.get("assignedPhysician")
    p_copy["lastReviewDate"] = p_copy.get("lastReviewDate")
    p_copy["last_review_date"] = p_copy.get("lastReviewDate")
    p_copy["auditHistory"] = p_copy.get("auditHistory", [])
    p_copy["audit_history"] = p_copy.get("auditHistory", [])

    return p_copy

def get_all_patients(
    sector: Optional[str] = None,
    status: Optional[str] = None,
    risk_level: Optional[str] = None,
    cesfam_name: Optional[str] = None
) -> List[Dict[str, Any]]:
    global _db_patients
    results = []
    for p in _db_patients:
        formatted = format_patient_response(p)
        if sector and formatted["sector"] != sector:
            continue
        if status and formatted["contraloriaStatus"] != status:
            continue
        if risk_level and formatted["nt118Risk"]["riskLevel"] != risk_level:
            continue
        if cesfam_name and formatted["cesfamName"] != cesfam_name:
            continue
        results.append(formatted)

    # Sort by priorityPosition / priority_position ascending
    results.sort(
        key=lambda x: x.get("priorityPosition")
        if x.get("priorityPosition") is not None
        else (x.get("priority_position") if x.get("priority_position") is not None else 999)
    )
    return results

def get_patient_by_id(patient_id: str) -> Optional[Dict[str, Any]]:
    global _db_patients
    for p in _db_patients:
        if p["id"] == patient_id:
            return p
    return None
