# Context — Torre de Control APS

## System Overview
Torre de Control APS (HealtImpactlab) is a clinical priority management platform for Chilean Primary Healthcare (APS) implementing the MINSAL NT 118 scoring algorithm for DM2 / cardiovascular patients.

## Key Components
- Backend: Python FastAPI (`backend/app/main.py`)
- Backend Tests: `backend/tests/`
- Frontend: React + TypeScript + Vite (`src/`)
- Domain Types: `src/types/patient.ts`
- API Client & Fallback Store: `src/services/api.ts`
- Mock Data: `src/data/mockPatients.ts`
- Key UI Components: `src/App.tsx`, `PrioritizedTable`, `PatientDetailPanel`, `PressureMap`, `KPICards`

## Core Requirements & Specifications
- NT 118 Algorithm: 5 sub-criteria (C1 HbA1c, C2 VFG, C3 CV complications, C4 Social determinants, C5 Days on waiting list) summing to max score 100.
- Risk levels: CRITICO >= 90, ALTO >= 75, MEDIO >= 50, BAJO < 50.
- Privacy / PII: RUT must be hashed using SHA-256 + salt before persistence or logging.
- API Endpoints:
  - `GET /api/pacientes` (paginated, priority-sorted, query params: sector, status, risk_level, cesfam_name)
  - `POST /api/priorizacion/calcular` (executes NT 118 engine, snake_case request, returns score, subscores, risk level, decompensations)
  - `PATCH /api/pacientes/{id}/contraloria` (records Contraloría decision in audit log, status: APROBADO, RECHAZADO, DERIVADO, PENDIENTE)
- Offline Resilience: UI must seamlessly operate using `fallbackPatientsStore` when backend is offline.
