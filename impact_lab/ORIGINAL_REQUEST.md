# Original User Request

## Initial Request — 2026-08-05T23:01:09Z

Build the complete fullstack E2E system for **Torre de Control APS — HealtImpactlab**, a
clinical priority management platform for Chilean Primary Healthcare (APS) that implements the
NT 118 MINSAL priority scoring algorithm (ECICEP programme) for DM2 / cardiovascular patients.

Working directory: `/Users/familia_bustos_estrada/Developer/HealtImpactlab/impact_lab`
Integrity mode: development

Reference codebase already in place at the working directory:
- Frontend: React + TypeScript + Vite (`src/`)
- Backend: Python FastAPI (`backend/app/`)
- Types: `src/types/patient.ts` — canonical Patient, NT118RiskScore, AuditLogEntry models
- API client: `src/services/api.ts` — bidirectional mappers, offline fallback store
- Mock data: `src/data/mockPatients.ts`

---

## Requirements

### R1. Backend FastAPI — Complete REST API

The backend must expose a working FastAPI server (`backend/app/main.py`) with these endpoints,
all tested with integration tests under `backend/tests/`:

- `GET /api/pacientes` — returns paginated, priority-sorted list of patients; supports query
  params: `sector`, `status` (contraloria), `risk_level`, `cesfam_name`.
- `POST /api/priorizacion/calcular` — executes the NT 118 scoring engine; accepts a
  `PriorizacionRequest` payload (snake_case); returns `NT118RiskScore` with `totalScore`,
  `riskLevel`, `subscores`, and `decompensations`.
- `PATCH /api/pacientes/{id}/contraloria` — records a Contraloría medical action
  (`APROBADO`, `RECHAZADO`, `DERIVADO`, `PENDIENTE`) in an append-only audit log per patient.
  Requires `new_status`, `clinical_note`, `physician_name`, `physician_role`.

The NT 118 engine must faithfully implement the five sub-criteria (C1 HbA1c, C2 VFG, C3 CV
complications, C4 Social determinants, C5 Days on waiting list) with scores summing to a
max of 100 and risk thresholds: CRITICO >= 90, ALTO >= 75, MEDIO >= 50, BAJO < 50.
PII (RUT) must be hashed (SHA-256 + salt) before any persistence or logging.

### R2. Frontend React — Full Dashboard Integration

The React app (`src/App.tsx`) must:

- Load patients asynchronously on mount via `fetchPacientes()` from `src/services/api.ts`,
  showing a spinner while loading and a clear error state on failure.
- Fall back gracefully to the in-memory `fallbackPatientsStore` (populated from `mockPatients.ts`)
  when the backend is unreachable — no unhandled runtime errors.
- The `PrioritizedTable` component must display the full priority-ranked list with risk badges,
  sector tags, days on waiting list, and current contraloria status.
- The `PatientDetailPanel` must show: NT 118 score breakdown (all 5 subscores), active
  decompensation factors, full audit history timeline, and action buttons to record a
  Contraloría decision with a required clinical note.
- The `PressureMap` component must compute program demand counts dynamically from the live
  patient dataset (not hardcoded values).
- The `KPICards` component must show: total patients, critical count, pending contraloría count,
  and average NT 118 score — all recomputed reactively when the patient list updates.

### R3. E2E Integration — Frontend <-> Backend Live Flow

When the backend is running locally (`http://localhost:8000`), a full E2E cycle must work:

1. Frontend fetches patient list from `GET /api/pacientes` -> renders table.
2. User selects a patient -> opens detail panel -> triggers `POST /api/priorizacion/calcular`
   with that patient's clinical data -> panel updates with fresh NT 118 score.
3. User records a Contraloría action -> `PATCH /api/pacientes/{id}/contraloria` is called ->
   patient row in table and detail panel update instantly with new status and audit entry.
4. When the backend is stopped, the UI must continue operating via the offline fallback
   (mock data + local score calculation) without any visible crash or blank screen.

### R4. Test Suite

- Backend: all existing `backend/tests/e2e/test_tier1_features.py` tests must pass with
  `pytest` inside the `backend/` directory.
- Frontend: `npm run build` must complete with zero TypeScript errors.
- There must be no `console.error` logs in the browser for normal happy-path flows.

---

## Acceptance Criteria

### Backend correctness
- [ ] `GET /api/pacientes` returns >= 10 mock patients sorted by `priorityPosition` ascending.
- [ ] `POST /api/priorizacion/calcular` with `hba1c=11.5, vfg=28, has_foot_ulcer=true` returns
      `riskLevel: "CRITICO"` and `totalScore >= 90`.
- [ ] `PATCH /api/pacientes/{id}/contraloria` appends a new entry to `auditHistory` and returns
      the updated patient with `contraloriaStatus` matching the submitted `new_status`.
- [ ] All `pytest` tests in `backend/tests/` pass (exit code 0).

### Frontend correctness
- [ ] `npm run build` in `impact_lab/` exits with code 0 (zero TS errors).
- [ ] With backend offline, the app loads mock patients and the Contraloría action updates
      local state without throwing any unhandled errors.
- [ ] `PressureMap` card for "DM2 / Diabetología APS" shows a non-zero demand count derived
      from the loaded patient list (not the hardcoded 24).

### E2E integration
- [ ] With backend running, recording a Contraloría action via the UI causes the patient row
      `contraloriaStatus` badge to update within the same render cycle (no page reload needed).
- [ ] The audit history timeline in the detail panel shows the newly recorded entry at the top.
