# Handoff Report — Explorer Backend (R1 Gap Analysis)

## 1. Observation
- **Original Request Requirements**: `ORIGINAL_REQUEST.md` (lines 23-41, 83-90) specifies R1 requirements:
  - `GET /api/pacientes` returns `>= 10 mock patients` sorted by `priorityPosition` ascending, supporting filters: `sector`, `status` (contraloria), `risk_level`, `cesfam_name`.
  - `POST /api/priorizacion/calcular` with `hba1c=11.5, vfg=28, has_foot_ulcer=true` returns `riskLevel: "CRITICO"` and `totalScore >= 90`.
  - `PATCH /api/pacientes/{id}/contraloria` supports status updates (`APROBADO`, `RECHAZADO`, `DERIVADO`, `PENDIENTE`) and appends audit log.
  - PII (RUT) must be hashed with SHA-256 + salt before persistence or logging.
  - Integration tests in `backend/tests/` must pass with `pytest`.
- **NT 118 Calculation Engine**: `backend/app/engine/nt118.py` (lines 28–35, 60–67, 87–95):
  - `hba1c > 11.0` adds 35 points; `vfg < 30.0` adds 30 points; `has_foot_ulcer = True` adds 20 points.
  - Total for `hba1c=11.5, vfg=28, has_foot_ulcer=true` with default age/days is `35 + 30 + 20 = 85` (evaluated as `"ALTO"` instead of `"CRITICO"` at line 140).
- **Mock Patients Dataset & Sorting**: `backend/app/data/mock_db.py` (lines 6–173, 218–237):
  - `get_initial_mock_patients()` defines only 5 patients (`PAT-001` through `PAT-005`).
  - `get_all_patients()` does not sort results by `priorityPosition` / `priority_position` ascending.
- **Contraloría Statuses**: `backend/app/api/endpoints/pacientes.py` (line 10):
  - `VALID_STATUSES = {"PENDIENTE", "APROBADO", "REQUIERE_REVISION", "OBSERVADO"}` — missing `"RECHAZADO"` and `"DERIVADO"`.
- **PII Hashing**: `backend/app/core/privacy.py` (lines 3–43):
  - Contains `mask_rut(rut)` for string masking (`12.458.***-K`), but lacks SHA-256 + salt hashing (`hash_rut`).
- **Test Execution Setup**: `backend/run_e2e_tests.sh` references `backend/.venv/bin/pytest`. Virtualenv `.venv` with installed dependencies (`fastapi`, `pytest`, `httpx`, `pydantic`) is currently missing.

## 2. Logic Chain
1. **Observation 1 & 2** show that evaluating `hba1c=11.5, vfg=28, has_foot_ulcer=true` through `calculate_nt118_score()` produces a score of 85 (`"ALTO"`), failing Acceptance Criterion 2 (`totalScore >= 90`, `riskLevel == "CRITICO"`). Increasing C1 for severe HbA1c > 11.0 from 35 to 40 yields 40 + 30 + 20 = 90 (`"CRITICO"`), satisfying the criterion.
2. **Observation 1 & 3** show that `mock_db.py` has 5 patients instead of 10 and does not sort by `priorityPosition` ascending. Expanding the mock dataset to 10 patients and sorting by `priorityPosition` ascending satisfies Acceptance Criterion 1.
3. **Observation 1 & 4** show `VALID_STATUSES` rejects `"RECHAZADO"` and `"DERIVADO"` with HTTP 422. Adding these two statuses satisfies R1 endpoint requirements.
4. **Observation 1 & 5** show `privacy.py` only masks RUT for display, missing mandatory SHA-256 + salt hashing. Adding `hash_rut()` and storing `rut_hash` satisfies R1 privacy requirements.
5. **Observation 1 & 6** show `pytest` cannot run without a populated `.venv`. Installing `requirements.txt` into `.venv` enables running `run_e2e_tests.sh`.

## 3. Caveats
- No code in `backend/app/` or `backend/tests/` was modified during this investigation (read-only analysis constraint enforced).
- Frontend compatibility was verified by examining `src/types/patient.ts` and `src/services/api.ts`, showing bidirectional mappers support both snake_case and camelCase attributes.

## 4. Conclusion
The backend architecture is well-structured, but requires 5 specific modifications in `backend/app/` (NT 118 scoring adjustment, 10-patient mock dataset expansion + sorting, Contraloría status expansion, SHA-256 RUT hashing, and venv setup) to achieve 100% compliance with R1 and pass all pytest integration tests.

## 5. Verification Method
- **NT 118 Calculation**: Execute `pytest backend/tests/e2e/test_tier1_features.py -k test_calculate_nt118` and verify `calculate_nt118_score({"hba1c": 11.5, "vfg": 28, "has_foot_ulcer": True})` returns `totalScore: 90` and `riskLevel: "CRITICO"`.
- **Patient List**: Call `GET /api/pacientes` and verify output has length >= 10 and is sorted by `priorityPosition` ascending.
- **Contraloría Actions**: Call `PATCH /api/pacientes/PAT-001/contraloria` with status `"DERIVADO"` and `"RECHAZADO"`, verifying HTTP status 200.
- **PII Hashing**: Verify `hash_rut("12.458.930-K")` returns 64-character SHA-256 hex string.
- **Test Suite**: Run `bash backend/run_e2e_tests.sh` and confirm all 25 tests pass.
