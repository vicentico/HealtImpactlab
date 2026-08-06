# Scope: Milestone M1 (Backend Scaffolding, Privacy & Audit Infrastructure)

## Objectives
1. Virtual environment & dependencies:
   - Setup Python 3.14 virtualenv at `impact_lab/backend/.venv`
   - Create `impact_lab/backend/requirements.txt` with dependencies: `fastapi`, `uvicorn`, `pydantic`, `pytest`, `httpx`.
2. Backend layout in `impact_lab/backend/`:
   - `app/main.py`: FastAPI server setup with CORS middleware allowing `http://localhost:3000` (or `*`), health check route `GET /health` returning `{"status": "ok"}`, OpenAPI Swagger docs accessible at `/docs`.
   - `app/core/privacy.py`: RUT PII masking utility (`mask_rut` converting e.g. `12.458.930-K` to `12.458.***-K` or unformatted `12458930K` into formatted masked representation).
   - `app/schemas/patient.py` and `app/schemas/priorizacion.py`: Pydantic models matching frontend data contracts (Patient, ClinicalVariables, PrioritizationResult, AuditLog, etc.).
   - `app/data/mock_db.py`: Pre-load initial patient dataset (based on mock patients), formatted with masked RUTs and initial audit logs.
3. Unit test suite:
   - `tests/test_m1.py`: Tests covering PII masking functionality, schema validation, and FastAPI application startup / `/health` endpoint.

## Interface Contracts & Standards
- Python Version: Python 3.14
- Base API Path: FastAPI app
- CORS Origins: `http://localhost:3000`, `*`
- RUT Masking Rule: Retain body prefix (e.g. `12.458.` or first 5 digits) and verification digit (e.g. `-K`), replacing central digits with `***`. Format: `XX.XXX.***-Y` or `XX.XXX.***-K`.

## Deliverables
- `impact_lab/backend/.venv`
- `impact_lab/backend/requirements.txt`
- `impact_lab/backend/app/__init__.py`
- `impact_lab/backend/app/main.py`
- `impact_lab/backend/app/core/__init__.py`
- `impact_lab/backend/app/core/privacy.py`
- `impact_lab/backend/app/schemas/__init__.py`
- `impact_lab/backend/app/schemas/patient.py`
- `impact_lab/backend/app/schemas/priorizacion.py`
- `impact_lab/backend/app/data/__init__.py`
- `impact_lab/backend/app/data/mock_db.py`
- `impact_lab/backend/tests/__init__.py`
- `impact_lab/backend/tests/test_m1.py`
