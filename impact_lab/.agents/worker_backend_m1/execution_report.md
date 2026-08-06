# Execution Report — Milestone M1 (Worker Backend)

## Overview
All 5 required tasks for Milestone M1 (Torre de Control APS — HealtImpactlab Backend) have been fully implemented, integrated, and verified against the pytest test suite.

## Summary of Changes

### Task 1: NT 118 Score Calculation Fix
- **File**: `backend/app/engine/nt118.py`
- **Modification**: Updated C1 subscore calculation so that `hba1c > 11.0` adds 40 points instead of 35.
- **Verification**: Evaluated case `hba1c=11.5, vfg=28, has_foot_ulcer=true`. Produced `totalScore = 90` and `riskLevel = "CRITICO"`. Verified via new unit test `test_calculate_nt118_hba1c_11_5_critico_score`.

### Task 2: Mock Dataset Expansion & Sorting
- **File**: `backend/app/data/mock_db.py`
- **Modification**: Expanded mock patient database from 5 to 10 patients (`PAT-001` through `PAT-010`).
- **Sorting**: Updated `get_all_patients()` to explicitly sort returned patients by `priorityPosition` / `priority_position` ascending.
- **Verification**: Verified `GET /api/pacientes` returns 10 patients ordered 1 to 10 via test `test_get_pacientes_unfiltered_200`.

### Task 3: Contraloría Statuses
- **Files**: `backend/app/api/endpoints/pacientes.py`, `backend/app/schemas/patient.py`
- **Modification**: Updated `VALID_STATUSES` and Pydantic schemas (`ContraloriaUpdatePayload`, `Patient`) to accept `"APROBADO"`, `"RECHAZADO"`, `"DERIVADO"`, and `"PENDIENTE"`.
- **Verification**: Verified via parametrized test `test_patch_contraloria_new_valid_statuses` covering all four target statuses.

### Task 4: PII SHA-256 Hashing
- **File**: `backend/app/core/privacy.py`
- **Modification**: Implemented `hash_rut(rut: str) -> str` using SHA-256 with a configurable salt string (`RUT_SALT`).
- **Integration**: `format_patient_response` in `mock_db.py` includes `rut_hash` / `rutHash`.
- **Verification**: Verified via `test_hash_rut_sha256_salted` testing normalization, SHA-256 64-char digest, idempotency, and empty string handling.

### Task 5: Virtualenv & Test Suite Update
- **Files**: `backend/.venv`, `backend/tests/e2e/test_tier1_features.py`
- **Modification**: Updated existing tests and added 6 new test cases in `test_tier1_features.py`.
- **Verification**: Executed `backend/.venv/bin/pytest`. All 26 tests pass cleanly with exit code 0.

## Test Results Summary
- **Total Tests**: 26 passed
- **Exit Code**: 0
- **Duration**: 0.22s
