# Project: Torre de Control APS — HealtImpactlab

## Architecture
- Backend: Python FastAPI (`backend/app/main.py`)
- Frontend: React + TypeScript + Vite (`src/App.tsx`)
- Shared domain types: `src/types/patient.ts`
- API client & offline fallback store: `src/services/api.ts`
- Mock database: `backend/app/data/mock_db.py`, `src/data/mockPatients.ts`

## Feature Inventory
Every feature from the Survey phase appears here with its assigned milestone.
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | GET /api/pacientes | Paginated, priority-sorted patient list (>=10 mock patients), filtering by sector, status, risk_level, cesfam_name | M1 | survey |
| 2 | POST /api/priorizacion/calcular | NT 118 scoring engine calculating 5 sub-criteria (C1 HbA1c, C2 VFG, C3 CV, C4 Social, C5 Days), risk thresholds (CRITICO >= 90 for hba1c=11.5, vfg=28, foot_ulcer=true) | M1 | survey |
| 3 | PATCH /api/pacientes/{id}/contraloria | Contraloría decision recording with statuses (APROBADO, RECHAZADO, DERIVADO, PENDIENTE) and append-only audit log | M1 | survey |
| 4 | PII SHA-256 Hashing | RUT hashing (SHA-256 + salt) before persistence or logging | M1 | survey |
| 5 | Async Patient Load & Fallback | React async patient fetching on mount with spinner, error state, and offline fallback store fallback | M2 | survey |
| 6 | PrioritizedTable Component | Priority-ranked patient table displaying risk badges, sector tags, days on waiting list, contraloría status | M2 | survey |
| 7 | PatientDetailPanel Component | Detail panel displaying 5 NT 118 subscores (C1-C5), decompensation factors, audit history timeline with transition badges, decision buttons (APROBADO, RECHAZADO, DERIVADO, PENDIENTE) | M2 | survey |
| 8 | PressureMap Component | Dynamic program demand counts computed strictly from live patient dataset (not static 24) | M2 | survey |
| 9 | KPICards Component | Reactive KPI cards: total patients, critical count, pending contraloría count, and Average NT 118 score | M2 | survey |
| 10 | E2E Live Flow & Calculation Trigger | Patient selection triggers `calcularNT118()` (`POST /api/priorizacion/calcular`), Contraloría action calls PATCH endpoint updating table/detail panel instantly | M3 | survey |
| 11 | Offline Fallback Resilience | Fully functional offline mode using local mock data and local score calculation when backend is stopped | M3 | survey |
| 12 | Backend Pytest Verification | 100% passing tests in `backend/tests/` with pytest (exit code 0) | M4 | survey |
| 13 | Frontend Build Verification | `npm run build` exits 0 with zero TypeScript errors and zero console errors | M4 | survey |

## Code Layout
- Backend files:
  - `backend/app/main.py` — FastAPI application entry point
  - `backend/app/api/endpoints/pacientes.py` — API routes for patients and contraloría
  - `backend/app/api/endpoints/priorizacion.py` — API route for NT118 scoring calculation
  - `backend/app/engine/nt118.py` — NT 118 calculation logic
  - `backend/app/core/privacy.py` — PII SHA-256 + salt hashing logic
  - `backend/app/data/mock_db.py` — Mock patients database (>=10 records)
  - `backend/app/schemas/patient.py` — Pydantic schemas
  - `backend/tests/` — pytest integration test suite
- Frontend files:
  - `src/App.tsx` — Main dashboard view and async loading state
  - `src/types/patient.ts` — TypeScript domain types (Patient, NT118RiskScore, AuditLogEntry, ContraloriaStatus)
  - `src/services/api.ts` — API client mappers & fallback store
  - `src/data/mockPatients.ts` — Frontend mock patients (>=10 records)
  - `src/components/PrioritizedTable.tsx` — Patient table
  - `src/components/PatientDetailPanel.tsx` — Patient detail panel & contraloría actions
  - `src/components/PressureMap.tsx` — Program demand map
  - `src/components/KPICards.tsx` — KPI summary cards

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Backend FastAPI & NT118 Engine | R1 backend endpoints, NT 118 score fix (C1=40 for HbA1c>11.0), SHA-256 RUT hashing, 10 mock patients, Contraloría statuses (RECHAZADO, DERIVADO) | none | IN_PROGRESS |
| 2 | M2: Frontend React Dashboard | R2 UI integration: C5 subscore, average NT 118 KPI card, Contraloría statuses, dynamic PressureMap demand, audit history badges | M1 | PLANNED |
| 3 | M3: E2E Integration & Offline Fallback | R3 live E2E flow, detail panel calculation trigger on select, offline fallback store seamless operation | M1, M2 | PLANNED |
| 4 | M4: Test Suite Verification & Hardening | R4 pytest execution, `npm run build` zero TS errors, zero console.error logs | M1, M2, M3 | PLANNED |

## Interface Contracts
### Frontend ↔ Backend API
- `GET /api/pacientes`
  - Query params: `sector?: string`, `status?: string`, `risk_level?: string`, `cesfam_name?: string`
  - Response: list of `Patient` (snake_case from backend, mapped to camelCase by `src/services/api.ts`), sorted by `priorityPosition` ascending.
- `POST /api/priorizacion/calcular`
  - Request: `PriorizacionRequest` (snake_case)
  - Response: `NT118RiskScore` with `totalScore`, `riskLevel`, `subscores` (including `c5_days_score` / `daysScore`), `decompensations`
- `PATCH /api/pacientes/{id}/contraloria`
  - Request: `{ new_status: 'APROBADO' | 'RECHAZADO' | 'DERIVADO' | 'PENDIENTE', clinical_note: string, physician_name: string, physician_role: string }`
  - Response: updated `Patient` object including updated `contraloria_status` and appended `audit_history`
