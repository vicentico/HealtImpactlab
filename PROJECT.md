# Project: Backend API & Motor NT 118 / ECICEP + React Frontend Integration

## Architecture
- Backend: Python 3.14 + FastAPI + Pydantic v2 + Uvicorn (running on port 8000)
- Engine: Algoritmo NT 118 MINSAL ($C_1..C_5$ subcriteria score calculation, 0-100 pts) + Causales de Egreso MINSAL RNLE (1-7)
- Security & Audit: Masking PII RUT (`12.458.***-K`) + Bitácora de Auditoría inmutable (`AuditLogEntry`)
- Frontend: React 18 + TypeScript 5 + Vite + Tailwind CSS v4 (running on port 3000)
- Communication: Client `src/services/api.ts` (fetch-based API client with snake_case <-> camelCase mapping and CORS proxy)

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | FastAPI Backend Core & Scaffolding | FastAPI app with CORS middleware, health check, OpenAPI Swagger at `/docs` | M1 | survey |
| 2 | PII RUT Masking & Privacy Utility | Mask RUT format `12.458.930-K` to `12.458.***-K` in DB and API payloads | M1 | survey |
| 3 | Bitácora Auditoría Inmutable | Append-only audit trail logging medical contraloría decisions (`AuditLogEntry`) | M1 | survey |
| 4 | Motor Priorización NT 118 ($C_1..C_5$) | Algorithm calculating weighted risk score (0-100 pts) & risk level (`CRITICO`, `ALTO`, `MEDIO`, `BAJO`) | M2 | survey |
| 5 | Egresos MINSAL RNLE | Business logic for MINSAL exit causals (1-7) and state transitions | M2 | survey |
| 6 | Endpoint `POST /api/priorizacion/calcular` | Endpoint returning NT 118 total score, subscores breakdown, and active decompensations | M2 | survey |
| 7 | Endpoint `GET /api/pacientes` | Endpoint returning prioritized waiting list filtered by CESFAM sector and status | M2 | survey |
| 8 | Endpoint `PATCH /api/pacientes/{id}/contraloria` | Endpoint updating medical contraloría status and appending to audit log | M2 | survey |
| 9 | Frontend API Client `src/services/api.ts` | Async fetch client replacing mock data with backend API calls | M3 | survey |
| 10 | Integración UI `PrioritizedTable.tsx` | Connect table to API backend for searching, filtering, and data display | M3 | survey |
| 11 | Integración UI `PatientDetailPanel.tsx` | Connect detail panel to API backend for score breakdown & status override | M3 | survey |
| 12 | Integración UI `PressureMap.tsx` | Connect pressure map to real-time capacity and demand metrics from backend | M3 | survey |
| 13 | Final E2E Suite & Hardening | 100% E2E test suite pass, Tier 5 adversarial testing, `npx tsc --noEmit` pass | M4 | survey |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Backend Scaffolding & Privacy/Audit | FastAPI server setup, Pydantic models, RUT masking, Audit log mechanics, virtualenv setup | none | DONE |
| M2 | NT 118 Engine & Endpoints | $C_1..C_5$ calculation engine, RNLE exit rules, POST /calcular, GET /pacientes, PATCH /contraloria | M1 | DONE |
| M3 | Frontend API Client & Component Integration | `src/services/api.ts`, `App.tsx` state migration, UI integration in `PrioritizedTable`, `PatientDetailPanel`, `PressureMap` | M2 | IN_PROGRESS |
| M4 | E2E Testing, Adversarial Hardening & Verification | E2E test suite execution (Tiers 1-4), Tier 5 adversarial hardening, TypeScript check (`npx tsc --noEmit`) | M3 | PLANNED |

## Interface Contracts

### Backend ↔ Frontend Contracts

#### 1. `POST /api/priorizacion/calcular`
- **Request Payload (`application/json`)**:
  - `patient_id` (string), `hba1c` (float), `systolic_bp` (int), `diastolic_bp` (int), `vfg` (float), `has_foot_ulcer` (bool), `has_retinopathy` (bool), `days_in_waiting_list` (int), `age` (int), `gender` (string), `sector` (string), `cesfam_name` (string)
- **Response Payload (`application/json`)**:
  - `total_score` (int 0-100), `risk_level` (`"CRITICO"` | `"ALTO"` | `"MEDIO"` | `"BAJO"`), `subscores` (`c1_hba1c_score`, `c2_renals_score`, `c3_cv_score`, `c4_social_score`), `decompensations` (array of `{code, label, severity, value}`)

#### 2. `GET /api/pacientes`
- **Query Parameters**:
  - `cesfam_name` (optional str), `sector` (optional str), `status` (optional str), `risk_level` (optional str)
- **Response Payload (`application/json` array)**:
  - List of `Patient` objects with `rut_masked`, `nt118_risk` object, `audit_history` list.

#### 3. `PATCH /api/pacientes/{id}/contraloria`
- **Request Payload (`application/json`)**:
  - `new_status` (string), `clinical_note` (string), `physician_name` (string), `physician_role` (string)
- **Response Payload (`application/json`)**:
  - Updated `Patient` object with new status and updated `audit_history`.

## Code Layout
- Backend: `impact_lab/backend/`
  - `app/main.py`: FastAPI entrypoint & CORS setup
  - `app/engine/nt118.py`: NT 118 calculation logic ($C_1..C_5$)
  - `app/engine/rnle.py`: MINSAL RNLE exit causals logic
  - `app/core/privacy.py`: RUT PII masking utility
  - `app/schemas/patient.py`, `app/schemas/priorizacion.py`: Pydantic models
  - `app/api/endpoints/pacientes.py`, `app/api/endpoints/priorizacion.py`: API routes
  - `app/data/mock_db.py`: In-memory patient database pre-loaded with patient records
  - `requirements.txt`: Python package dependencies
- Frontend: `impact_lab/`
  - `src/services/api.ts`: API client functions (`getPacientes`, `calcularPriorizacion`, `updateContraloriaStatus`)
  - `src/types/patient.ts`: Frontend domain interfaces
  - `src/App.tsx`: Top-level state and API integration
  - `src/components/PrioritizedTable.tsx`, `PatientDetailPanel.tsx`, `PressureMap.tsx`
