# E2E Test Infra: Backend API & Motor NT 118 / ECICEP + React Frontend

## Test Philosophy
- Opaque-box, requirement-driven E2E validation.
- Verification covers API endpoints, algorithm score correctness, PII masking, audit log integrity, and frontend TypeScript compilation.

## Feature Inventory & Test Coverage
| # | Feature | Tier 1 (Coverage) | Tier 2 (Boundary) | Tier 3 (Cross) | Tier 4 (Scenario) |
|---|---------|-------------------|-------------------|----------------|-------------------|
| 1 | FastAPI Backend Core & Scaffolding | ✓ (Health check) | ✓ (Docs endpoint) | ✓ (CORS) | ✓ (Server lifecycle) |
| 2 | PII RUT Masking & Privacy Utility | ✓ (Basic RUT) | ✓ (K digit/short) | ✓ (API payload) | ✓ (DB vs Response) |
| 3 | Bitácora Auditoría Inmutable | ✓ (Append log) | ✓ (Empty note) | ✓ (Multiple updates)| ✓ (Full audit trail) |
| 4 | Motor Priorización NT 118 ($C_1..C_5$) | ✓ (Normal score) | ✓ (Max/Min limits) | ✓ (Decompensations) | ✓ (Recalculation flow) |
| 5 | Egresos MINSAL RNLE | ✓ (Exit rules 1-7)| ✓ (Invalid code) | ✓ (Status transition)| ✓ (Full exit lifecycle) |
| 6 | Endpoint `POST /api/priorizacion/calcular` | ✓ (Calculate 200)| ✓ (Validation err)| ✓ (Pydantic schema)| ✓ (Interactive calc) |
| 7 | Endpoint `GET /api/pacientes` | ✓ (List 200) | ✓ (Empty sector) | ✓ (Multi-filter) | ✓ (Table load flow) |
| 8 | Endpoint `PATCH /api/pacientes/{id}/contraloria` | ✓ (Patch 200) | ✓ (Invalid status)| ✓ (Log append) | ✓ (Contraloria audit) |
| 9 | Frontend API Client `src/services/api.ts` | ✓ (Fetch methods) | ✓ (Network error) | ✓ (CamelCase mapping)| ✓ (App Integration) |
| 10 | Integración UI `PrioritizedTable.tsx` | ✓ (Table render) | ✓ (No matches) | ✓ (Filter + Search)| ✓ (Live table state) |
| 11 | Integración UI `PatientDetailPanel.tsx` | ✓ (Drawer open) | ✓ (Missing data) | ✓ (Contraloria form)| ✓ (Drawer update flow) |
| 12 | Integración UI `PressureMap.tsx` | ✓ (Grid render) | ✓ (Zero capacity) | ✓ (Metrics update) | ✓ (Live capacity grid) |

## Verification Commands
- Backend pytest suite: `pytest impact_lab/backend/tests/`
- Frontend TypeScript check: `npx tsc --noEmit` inside `impact_lab/`
- Frontend build check: `npm run build` inside `impact_lab/`
