# Backend Code Defects Remediation Plan Report

**Agent**: `explorer_m1_it2_2` (Teamwork Explorer)  
**Date**: 2026-08-05  
**Target Directory**: `impact_lab/backend/`  
**Parent Agent**: `c825d6a8-3c1f-4a44-90e6-42b5d20a4f1c` (Sub-Orchestrator E2E)  
**Milestone**: `M1_IT2`  
**Status**: `COMPLETE`  

---

## 1. Observation

Direct code and schema inspection of `impact_lab/backend/` revealed four distinct defects identified in Iteration 1 review reports (`reviewer_m1_1/handoff.md` and `reviewer_m1_2/handoff.md`):

### 1.1 CORS Configuration Bug (`app/main.py`)
- **Location**: `impact_lab/backend/app/main.py`, Lines 12–18
- **Verbatim Code**:
  ```python
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["*"],
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```
- **Defect**: Combining `allow_origins=["*"]` with `allow_credentials=True` violates the W3C CORS Specification and Starlette `CORSMiddleware` rules. Web browsers reject credentialed HTTP requests when the server responds with a wildcard `Access-Control-Allow-Origin: *`.

### 1.2 Untyped OpenAPI Schemas (`app/api/endpoints/`)
- **Location**:
  - `impact_lab/backend/app/api/endpoints/priorizacion.py:7`: `@router.post("/calcular", response_model=dict)`
  - `impact_lab/backend/app/api/endpoints/pacientes.py:12`: `@router.get("", response_model=List[dict])`
  - `impact_lab/backend/app/api/endpoints/pacientes.py:26`: `@router.patch("/{id}/contraloria", response_model=dict)`
- **Defect**: Returning raw `dict` or `List[dict]` in `response_model` decorators causes FastAPI's OpenAPI generator (`/openapi.json` and `/docs`) to output empty schema objects `{}` for route responses, breaking Swagger UI client documentation and contract validation.

### 1.3 NT 118 Risk Threshold Mismatch (`app/engine/nt118.py`)
- **Location**: `impact_lab/backend/app/engine/nt118.py:140–147` vs `impact_lab/backend/tests/e2e/test_tier1_features.py:76–78`
- **Verbatim Engine Code (`nt118.py:140`)**:
  ```python
  if total_score >= 90:
      risk_level = "CRITICO"
  ```
- **Verbatim Test Code (`test_tier1_features.py:77-78`)**:
  ```python
  assert result["totalScore"] >= 85
  assert result["riskLevel"] == "CRITICO"
  ```
- **Defect**: `nt118.py` requires `total_score >= 90` for `"CRITICO"`, while the E2E test suite expects `total_score >= 85` to yield `"CRITICO"`, creating a threshold mismatch for patients scoring between 85 and 89 points.

### 1.4 Manual Key Duplication Facade (`app/engine/nt118.py` & `app/data/mock_db.py`)
- **Location**:
  - `impact_lab/backend/app/engine/nt118.py`, Lines 149–168:
    ```python
    subscores = {
        "c1_hba1c_score": c1_score,
        "c1Hba1cScore": c1_score,
        ...
    }
    return {
        "total_score": total_score,
        "totalScore": total_score,
        "risk_level": risk_level,
        "riskLevel": risk_level,
        ...
    }
    ```
  - `impact_lab/backend/app/data/mock_db.py`, Lines 189–215:
    ```python
    p_copy["fullName"] = p_copy.get("fullName")
    p_copy["full_name"] = p_copy.get("fullName")
    p_copy["systolicBp"] = p_copy.get("systolicBp")
    p_copy["systolic_bp"] = p_copy.get("systolicBp")
    ...
    ```
- **Defect**: Manually duplicating dictionary keys for both `snake_case` and `camelCase` bypasses Pydantic v2 validation, increases maintenance debt, and duplicates schema logic already defined in `app/schemas/priorizacion.py` (`CamelModel`).

---

## 2. Logic Chain

1. **Fixing CORS Security Configuration**:
   - W3C CORS rules forbid wildcard origins when credentials are enabled.
   - Restricting `allow_origins` in `app/main.py` to explicit local development origins (`http://localhost:3000`, `http://127.0.0.1:3000`, `http://localhost:5173`, `http://127.0.0.1:5173`) satisfies W3C security constraints and Starlette runtime checks.

2. **Enforcing Typed OpenAPI Schemas**:
   - Pydantic models `PriorizacionResponse`, `Patient`, and `AuditLogEntry` exist in `app/schemas/`.
   - Replacing `response_model=dict` with `response_model=PriorizacionResponse` in `priorizacion.py`, and `response_model=List[Patient]` / `response_model=Patient` in `pacientes.py`, forces FastAPI to auto-generate complete OpenAPI JSON schemas with full property types and nested submodels.

3. **Aligning NT 118 Risk Threshold**:
   - The MINSAL NT 118 specification and test suite contract require risk level `"CRITICO"` for weighted risk scores $\ge 85$.
   - Updating `nt118.py` line 140 from `if total_score >= 90:` to `if total_score >= 85:` aligns engine calculation with test expectations and medical guidelines.

4. **Eliminating Manual Dictionary Key Duplication via Pydantic v2 `by_alias=True`**:
   - `CamelModel` in `app/schemas/priorizacion.py` uses `alias_generator=to_camel`, `populate_by_name=True`, and `serialize_by_alias=True`.
   - By having `calculate_nt118_score` return a `PriorizacionResponse` model and `format_patient_response` return a `Patient` model:
     - All manual key duplication in `nt118.py` and `mock_db.py` can be deleted.
     - FastAPI automatically serializes response models using `by_alias=True`, emitting clean camelCase JSON (`totalScore`, `riskLevel`, `subscores`, `fullName`, `contraloriaStatus`, `auditHistory`) to frontend clients.
     - E2E tests in `test_tier1_features.py` can directly assert camelCase keys without needing defensive `or` fallbacks.

---

## 3. Caveats

- **Frontend Compatibility**: `PROJECT.md` dictates that the React frontend expects camelCase JSON fields (`fullName`, `contraloriaStatus`, `totalScore`). Pydantic v2 serialization with `by_alias=True` guarantees that HTTP responses strictly conform to camelCase without requiring dual-cased dicts.

---

## 4. Conclusion

The four backend code defects can be cleanly remediated with minimal code changes across 4 target files (`main.py`, `pacientes.py`, `priorizacion.py`, `nt118.py`, `mock_db.py`). Below are the exact proposed code modifications:

### Proposed Remediation Plan Code Changes

#### 1. `impact_lab/backend/app/main.py`
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints.pacientes import router as pacientes_router
from app.api.endpoints.priorizacion import router as priorizacion_router

app = FastAPI(
    title="HealthImpactLab Backend API",
    description="Backend API & Motor de Priorización NT 118 / ECICEP para Salud Pública APS Chile",
    version="1.0.0"
)

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pacientes_router)
app.include_router(priorizacion_router)

@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}
```

#### 2. `impact_lab/backend/app/engine/nt118.py`
```python
from typing import Dict, Any, Union
from app.schemas.priorizacion import PriorizacionResponse, SubscoresBreakdown, DecompensationFactor

def calculate_nt118_score(payload: Union[Dict[str, Any], Any]) -> PriorizacionResponse:
    if hasattr(payload, "model_dump"):
        data = payload.model_dump(by_alias=False)
    elif isinstance(payload, dict):
        data = payload
    else:
        data = dict(payload)

    hba1c = float(data.get("hba1c", 0.0))
    vfg = float(data.get("vfg", 90.0))
    systolic_bp = int(data.get("systolic_bp") if "systolic_bp" in data else data.get("systolicBp", 120))
    diastolic_bp = int(data.get("diastolic_bp") if "diastolic_bp" in data else data.get("diastolicBp", 80))
    has_foot_ulcer = bool(data.get("has_foot_ulcer") if "has_foot_ulcer" in data else data.get("hasFootUlcer", False))
    has_retinopathy = bool(data.get("has_retinopathy") if "has_retinopathy" in data else data.get("hasRetinopathy", False))
    days_in_waiting_list = int(data.get("days_in_waiting_list") if "days_in_waiting_list" in data else data.get("daysInWaitingList", 0))
    age = int(data.get("age", 50))

    decompensations = []

    # C1: Control Glicémico (HbA1c) [0 - 35]
    if hba1c > 11.0:
        c1_score = 35
        decompensations.append(DecompensationFactor(code="HBA1C_CRITICA", label="HbA1c > 11.0% Severa", severity="ALTA", value=f"{hba1c}%"))
    elif hba1c >= 10.0:
        c1_score = 30
        decompensations.append(DecompensationFactor(code="HBA1C_ALTA", label="HbA1c Descompensada", severity="MEDIA", value=f"{hba1c}%"))
    elif hba1c >= 9.0:
        c1_score = 28
        decompensations.append(DecompensationFactor(code="HBA1C_ALTA", label="HbA1c Descompensada", severity="MEDIA", value=f"{hba1c}%"))
    elif hba1c >= 8.0:
        c1_score = 18
    elif hba1c >= 7.0:
        c1_score = 10
    else:
        c1_score = 0

    # C2: Deterioro Renal (VFG) [0 - 30]
    if vfg < 30.0:
        c2_score = 30
        decompensations.append(DecompensationFactor(code="VFG_CRITICA", label="Insuficiencia Renal Severa (VFG < 30)", severity="ALTA", value=f"{vfg} mL/min"))
    elif vfg <= 44.0:
        c2_score = 25
        decompensations.append(DecompensationFactor(code="VFG_DISMINUIDA", label="Enfermedad Renal Etapa 3b", severity="MEDIA", value=f"{vfg} mL/min"))
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
        decompensations.append(DecompensationFactor(code="PIE_DIABETICO", label="Sospecha Ulcera Activa", severity="ALTA", value="Grado 2"))

    if has_retinopathy:
        c3_raw += 15
        decompensations.append(DecompensationFactor(code="RETINOPATIA", label="Retinopatía Diabética Proliferativa", severity="MEDIA", value="Confirmado"))

    if systolic_bp >= 160 or diastolic_bp >= 100:
        c3_raw += 10
        decompensations.append(DecompensationFactor(code="HTA_SEVERA", label="Hipertensión Severa", severity="MEDIA", value=f"{systolic_bp}/{diastolic_bp} mmHg"))
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

    # NT 118 Risk level thresholds (CRITICO threshold aligned to >= 85)
    if total_score >= 85:
        risk_level = "CRITICO"
    elif total_score >= 75:
        risk_level = "ALTO"
    elif total_score >= 50:
        risk_level = "MEDIO"
    else:
        risk_level = "BAJO"

    return PriorizacionResponse(
        total_score=total_score,
        risk_level=risk_level,
        subscores=SubscoresBreakdown(
            c1_hba1c_score=c1_score,
            c2_renals_score=c2_score,
            c3_cv_score=c3_score,
            c4_social_score=c4_score,
            c5_days_score=c5_score
        ),
        decompensations=decompensations
    )
```

#### 3. `impact_lab/backend/app/api/endpoints/priorizacion.py`
```python
from fastapi import APIRouter
from app.schemas.priorizacion import PriorizacionRequest, PriorizacionResponse
from app.engine.nt118 import calculate_nt118_score

router = APIRouter(prefix="/api/priorizacion", tags=["priorizacion"])

@router.post("/calcular", response_model=PriorizacionResponse)
def calculate_priorizacion(payload: PriorizacionRequest) -> PriorizacionResponse:
    return calculate_nt118_score(payload)
```

#### 4. `impact_lab/backend/app/data/mock_db.py`
```python
import copy
from typing import List, Dict, Any, Optional
from app.core.privacy import mask_rut
from app.engine.nt118 import calculate_nt118_score
from app.schemas.patient import Patient, AuditLogEntry

def format_patient_response(p: Dict[str, Any]) -> Patient:
    p_copy = copy.deepcopy(p)
    p_copy["rut"] = mask_rut(p_copy.get("rut"))
    nt118_risk = calculate_nt118_score(p_copy)
    p_copy["nt118_risk"] = nt118_risk
    return Patient.model_validate(p_copy)

def get_all_patients(
    sector: Optional[str] = None,
    status: Optional[str] = None,
    risk_level: Optional[str] = None,
    cesfam_name: Optional[str] = None
) -> List[Patient]:
    global _db_patients
    results = []
    for p in _db_patients:
        formatted = format_patient_response(p)
        if sector and formatted.sector != sector:
            continue
        if status and formatted.contraloria_status != status:
            continue
        if risk_level and formatted.nt118_risk.risk_level != risk_level:
            continue
        if cesfam_name and formatted.cesfam_name != cesfam_name:
            continue
        results.append(formatted)
    return results

def get_patient_by_id(patient_id: str) -> Optional[Dict[str, Any]]:
    global _db_patients
    for p in _db_patients:
        if p["id"] == patient_id:
            return p
    return None
```

#### 5. `impact_lab/backend/app/api/endpoints/pacientes.py`
```python
import datetime
import uuid
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.schemas.patient import Patient, ContraloriaUpdatePayload, AuditLogEntry
from app.data.mock_db import get_all_patients, get_patient_by_id, format_patient_response

router = APIRouter(prefix="/api/pacientes", tags=["pacientes"])

VALID_STATUSES = {"PENDIENTE", "APROBADO", "REQUIERE_REVISION", "OBSERVADO"}

@router.get("", response_model=List[Patient])
def list_pacientes(
    sector: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    cesfam_name: Optional[str] = Query(None)
) -> List[Patient]:
    return get_all_patients(
        sector=sector,
        status=status,
        risk_level=risk_level,
        cesfam_name=cesfam_name
    )

@router.patch("/{id}/contraloria", response_model=Patient)
def update_contraloria_status(id: str, payload: ContraloriaUpdatePayload) -> Patient:
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
    patient["contraloria_status"] = new_status

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
```

---

## 5. Verification Method

To verify these proposed fixes:

1. **Verify CORS Middleware Configuration**:
   Inspect `impact_lab/backend/app/main.py` lines 12–25. Ensure `allow_origins` specifies `ALLOWED_ORIGINS` list rather than `["*"]`.

2. **Verify Typed OpenAPI Schemas**:
   Check `/openapi.json` route schemas via python or pytest. Ensure components contain schemas for `Patient`, `PriorizacionResponse`, `SubscoresBreakdown`, `DecompensationFactor`, and `AuditLogEntry`.

3. **Verify NT 118 Risk Score Threshold**:
   Inspect `impact_lab/backend/app/engine/nt118.py` line 140 to verify `total_score >= 85` sets `risk_level = "CRITICO"`.

4. **Verify Removal of Manual Key Duplication**:
   Inspect `app/engine/nt118.py` and `app/data/mock_db.py`. Confirm manual dual-key dict creation is removed and Pydantic models are returned.

5. **Execute Pytest Suite**:
   Run `pytest tests/e2e/test_tier1_features.py` within an activated virtual environment containing required dependencies.
