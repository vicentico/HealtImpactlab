# Technical Analysis Report — Backend Gap Analysis (R1 & Acceptance Criteria)

**Agent**: Explorer Backend  
**Date**: 2026-08-05  
**Target System**: Torre de Control APS — HealthImpactLab Backend (`backend/app/`)  
**Scope**: FastAPI endpoints, NT 118 scoring engine, Contraloría audit log, PII hashing, mock dataset, and pytest integration test suite.

---

## Executive Summary

The current FastAPI backend structure in `backend/app/` provides a solid foundational architecture with endpoints, Pydantic schemas, and a mock database store. However, a detailed investigation against the **R1 Requirements** and **Acceptance Criteria** in `ORIGINAL_REQUEST.md` revealed 5 specific functional and structural gaps that prevent complete R1 compliance and test suite execution.

---

## Findings & Gap Breakdown

### Gap 1: NT 118 Scoring Engine — Decompensated Clinical Risk Threshold
- **Requirement**: `POST /api/priorizacion/calcular` with `hba1c=11.5, vfg=28, has_foot_ulcer=true` must return `riskLevel: "CRITICO"` and `totalScore >= 90`.
- **File**: `backend/app/engine/nt118.py` (lines 28–35, 60–67, 87–95, 140–148)
- **Observation**:
  - Current C1 (HbA1c > 11.0%) = 35 pts.
  - Current C2 (VFG < 30.0) = 30 pts.
  - Current C3 (has_foot_ulcer = True) = 20 pts.
  - C4 (age 50) = 0 pts, C5 (days 0) = 0 pts.
  - Calculated total score: `35 + 30 + 20 = 85`.
  - Risk level mapping: `total_score >= 90` -> `"CRITICO"`, `total_score >= 75` -> `"ALTO"`.
  - Result: Yields `totalScore: 85` and `riskLevel: "ALTO"`, violating the AC test requirement (`totalScore >= 90`, `CRITICO`).
- **Proposed Solution**:
  - Adjust C1 scoring for `hba1c > 11.0` to **40 points** (or C3 active foot ulcer to **25 points** / C2 VFG < 30 to **35 points**).
  - With C1 = 40 pts, `40 + 30 + 20 = 90 pts` -> triggers `riskLevel: "CRITICO"`.

### Gap 2: Mock Patient Dataset & Sorting
- **Requirement**: `GET /api/pacientes` must return `>= 10 mock patients` sorted by `priorityPosition` ascending.
- **File**: `backend/app/data/mock_db.py` (lines 6–173, 218–237)
- **Observation**:
  - `get_initial_mock_patients()` currently defines only **5 mock patients** (`PAT-001` to `PAT-005`).
  - `get_all_patients()` filters patients but does **not** sort the list by `priorityPosition` ascending before returning.
- **Proposed Solution**:
  - Expand `get_initial_mock_patients()` in `mock_db.py` to include 10 patients (`PAT-001` through `PAT-010`).
  - In `get_all_patients()`, add explicit sorting: `results.sort(key=lambda p: p.get("priorityPosition", p.get("priority_position", 999)))`.

### Gap 3: Contraloría Status Allowed Values
- **Requirement**: `PATCH /api/pacientes/{id}/contraloria` must support recording actions `APROBADO`, `RECHAZADO`, `DERIVADO`, `PENDIENTE` (in addition to `REQUIERE_REVISION`, `OBSERVADO`).
- **File**: `backend/app/api/endpoints/pacientes.py` (line 10)
- **Observation**:
  - `VALID_STATUSES = {"PENDIENTE", "APROBADO", "REQUIERE_REVISION", "OBSERVADO"}`.
  - Statuses `"RECHAZADO"` and `"DERIVADO"` are rejected with HTTP 422.
- **Proposed Solution**:
  - Update `VALID_STATUSES` in `pacientes.py` to include `{"PENDIENTE", "APROBADO", "RECHAZADO", "DERIVADO", "REQUIERE_REVISION", "OBSERVADO"}`.

### Gap 4: Missing PII Hashing (SHA-256 + Salt)
- **Requirement**: "PII (RUT) must be hashed (SHA-256 + salt) before any persistence or logging."
- **File**: `backend/app/core/privacy.py` and `backend/app/data/mock_db.py`
- **Observation**:
  - `privacy.py` contains `mask_rut(...)` for display masking (`12.458.***-K`), but has no SHA-256 + salt hashing function.
  - `mock_db.py` does not calculate or persist `rut_hash`.
- **Proposed Solution**:
  - Add `hash_rut(rut: str | None, salt: str = "healthimpactlab_salt_2026") -> str` to `privacy.py` using `hashlib.sha256`.
  - Include `rutHash` / `rut_hash` field in mock patient data and format functions.

### Gap 5: Virtual Environment Dependencies for Pytest
- **Requirement**: All `pytest` tests in `backend/tests/` pass with exit code 0.
- **File**: `backend/run_e2e_tests.sh`, `backend/requirements.txt`
- **Observation**:
  - `.venv` referenced in `run_e2e_tests.sh` is missing or lacks installed packages (`pytest`, `fastapi`, `httpx`).
- **Proposed Solution**:
  - Create Python virtual environment `.venv` inside `backend/` and install `requirements.txt` dependencies.

---

## Proposed Code Changes (Diff Sketches)

### 1. `backend/app/engine/nt118.py`
```python
# Line 28
if hba1c > 11.0:
    c1_score = 40  # Updated from 35 to ensure severe HbA1c + VFG <30 + foot ulcer reaches score >= 90 (CRITICO)
    decompensations.append({
        "code": "HBA1C_CRITICA",
        "label": "HbA1c > 11.0% Severa",
        "severity": "ALTA",
        "value": f"{hba1c}%"
    })
```

### 2. `backend/app/api/endpoints/pacientes.py`
```python
# Line 10
VALID_STATUSES = {"PENDIENTE", "APROBADO", "RECHAZADO", "DERIVADO", "REQUIERE_REVISION", "OBSERVADO"}
```

### 3. `backend/app/core/privacy.py`
```python
import hashlib
import re

def hash_rut(rut: str | None, salt: str = "healthimpactlab_salt_2026") -> str:
    """
    Computes SHA-256 hash of normalized RUT string with salt for PII privacy compliance.
    """
    if not rut:
        return ""
    clean = re.sub(r'[\.\-\s]', '', str(rut)).upper()
    salted_str = f"{clean}:{salt}"
    return hashlib.sha256(salted_str.encode('utf-8')).hexdigest()
```

### 4. `backend/app/data/mock_db.py`
```python
# Expand to 10 patients and add sorting:
def get_all_patients(...):
    # ... filtering ...
    results.sort(key=lambda p: p.get("priorityPosition", p.get("priority_position", 999)))
    return results
```

---

## Verification Matrix

| Requirement | Test Command / Procedure | Expected Result |
|---|---|---|
| NT 118 Critico Score (AC 2) | `pytest backend/tests/e2e/test_tier1_features.py -k test_calculate_nt118` | `totalScore >= 90`, `riskLevel == "CRITICO"` |
| Pacientes List (AC 1) | `GET /api/pacientes` via test client | Returns >= 10 patients sorted by `priorityPosition` |
| Contraloría Actions (AC 3) | `PATCH /api/pacientes/PAT-001/contraloria` with status `DERIVADO` / `RECHAZADO` | HTTP 200, audit entry appended |
| RUT Hashing | Unit test `hash_rut("12.458.930-K")` | Returns valid SHA-256 hex string |
| Full Test Suite (AC 4) | `run_e2e_tests.sh` | Exit code 0, 25/25 tests pass |
