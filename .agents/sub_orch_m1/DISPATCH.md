# DISPATCH — Milestone M1

## 2026-08-05T21:27:51Z
You are the Sub-orchestrator for Milestone M1 (Backend Scaffolding, Privacy & Audit Infrastructure).
Your working directory is: /Users/familia_bustos_estrada/Developer/HealtImpactlab/.agents/sub_orch_m1

MANDATORY FIRST STEP: Read the files at:
1. /Users/familia_bustos_estrada/Developer/HealtImpactlab/.agents/ORIGINAL_REQUEST.md
2. /Users/familia_bustos_estrada/Developer/HealtImpactlab/PROJECT.md

Your scope (Milestone M1):
1. Setup Python 3.14 virtualenv at `/Users/familia_bustos_estrada/Developer/HealtImpactlab/impact_lab/backend/.venv` and create `requirements.txt` (`fastapi`, `uvicorn`, `pydantic`, `pytest`, `httpx`).
2. Scaffold backend layout in `impact_lab/backend/`:
   - `app/main.py`: FastAPI server setup with CORS middleware allowing `http://localhost:3000` (or `*`), health check route `GET /health`, OpenAPI Swagger docs at `/docs`.
   - `app/core/privacy.py`: RUT PII masking utility (`mask_rut` formatting `12.458.930-K` -> `12.458.***-K`).
   - `app/schemas/patient.py` and `app/schemas/priorizacion.py`: Pydantic models matching frontend interface contracts.
   - `app/data/mock_db.py`: Pre-load initial patient dataset (based on initial mock patients), formatted with masked RUTs and initial audit logs.
3. Unit test suite in `impact_lab/backend/tests/test_m1.py` verifying PII masking, schemas, and FastAPI app startup.

Orchestrator Workflow:
You are an orchestrator for M1 scope! Follow the iteration loop:
1. Create `SCOPE.md` in your working directory.
2. Dispatch Explorer(s) if technical exploration is needed.
3. Dispatch Worker (`teamwork_preview_worker`) to implement code & run pytest verification. MANDATORY WARNING: DO NOT CHEAT. All implementations must be genuine.
4. Dispatch Reviewer (`teamwork_preview_reviewer`) and Challenger (`teamwork_preview_challenger`) to verify implementation and tests.
5. Dispatch Auditor (`teamwork_preview_auditor`) to run forensic integrity audit.
6. Evaluate gate criteria. If pass, write your report to `/Users/familia_bustos_estrada/Developer/HealtImpactlab/.agents/sub_orch_m1/handoff.md` and report DONE to parent orchestrator.

Remember:
- Keep your working directory state updated (`progress.md`, `BRIEFING.md`, `GATE_STATUS.md`).
- Pass the path to ORIGINAL_REQUEST.md to all subagents you spawn.
