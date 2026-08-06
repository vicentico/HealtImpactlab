## 2026-08-05T23:08:05Z

Task details for M1:
1. NT 118 score calculation fix:
   In `backend/app/engine/nt118.py`, update C1 subscore logic so that `hba1c > 11.0` adds 40 points (instead of 35). Verify that `hba1c=11.5, vfg=28, has_foot_ulcer=true` returns `totalScore >= 90` and `riskLevel == "CRITICO"`.
2. Mock dataset expansion & sorting:
   In `backend/app/data/mock_db.py`, expand mock dataset from 5 to 10 patients (`PAT-001` through `PAT-010`). Ensure `get_all_patients()` returns patients sorted by `priorityPosition` / `priority_position` ascending.
3. Contraloría statuses:
   In `backend/app/api/endpoints/pacientes.py` and `backend/app/schemas/patient.py`, update `VALID_STATUSES` and Pydantic schemas to accept `"APROBADO"`, `"RECHAZADO"`, `"DERIVADO"`, and `"PENDIENTE"`.
4. PII Hashing:
   In `backend/app/core/privacy.py`, implement `hash_rut(rut: str) -> str` using SHA-256 with a salt string. Call `hash_rut` before persisting/logging RUT data.
5. Virtualenv & Test Execution:
   Ensure `backend/.venv` is active/created and dependencies from `backend/requirements.txt` are installed. Update `backend/tests/e2e/test_tier1_features.py` to assert `len(data) >= 10` for `GET /api/pacientes` and test `POST /api/priorizacion/calcular` and `PATCH /api/pacientes/{id}/contraloria` with new statuses.
6. Run `pytest` inside `backend/` and ensure all tests pass with exit code 0.
7. Write your execution report and `handoff.md` inside `.agents/worker_backend_m1/`.
8. Send a message to parent (`d59e830e-788d-444d-b23f-e5cbd10430d6`) referencing `handoff.md`.
