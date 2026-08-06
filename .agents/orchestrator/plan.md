# Master Project Plan: Backend API & Motor NT 118 / ECICEP Integration

## Objective
Desarrollo e integración End-to-End del Backend API (Python / FastAPI) y motor de priorización NT 118 / ECICEP integrado con el Frontend React 18 en `impact_lab/`.

## Milestones & Strategy

### Phase 0: Discovery & Survey (In Progress)
- **Explorer 1 (Frontend)**: Map `impact_lab/src/`, `PrioritizedTable.tsx`, `PatientDetailPanel.tsx`, `PressureMap.tsx`, mock structures, types, and required API contracts.
- **Explorer 2 (Backend & Engine)**: Map `impact_lab/backend/` or create backend architecture plan: FastAPI endpoints (`POST /api/priorizacion/calcular`, `GET /api/pacientes`, OpenAPI `/docs`), Pydantic models, NT 118 score calculation algorithm ($C_1..C_5$), RNLE exit causes, PII masking, auditable log.
- **Explorer 3 (E2E Infra & Verification)**: Map build/test setup, TypeScript configuration, test runner setup, and E2E validation requirements.

### Phase 1: Architecture & Feature Inventory Definition
- Synthesize findings into `PROJECT.md` (Feature Inventory, Architecture, Interface Contracts, Code Layout).
- Spawn E2E Testing Orchestrator to generate `TEST_INFRA.md` and complete test suite (Tiers 1-4).

### Phase 2: Implementation Track
- Sub-orchestrators for milestones:
  - M1: Backend FastAPI Core & Pydantic Schemas + PII RUT Masking & Audit Log.
  - M2: NT 118 / ECICEP Engine Core ($C_1..C_5$ + RNLE rules) & Calculation Endpoints.
  - M3: Frontend API Service Client (`src/services/api.ts`) & UI Integration (`PrioritizedTable.tsx`, `PatientDetailPanel.tsx`, `PressureMap.tsx`).
  - M4: E2E Integration & Hardening (Phase 1 E2E suite pass + Phase 2 Adversarial Tier 5 hardening + `npx tsc --noEmit`).

### Phase 3: Final Acceptance & Reporting
- Final audit & verification gate check.
- Victory declaration and final summary report.
