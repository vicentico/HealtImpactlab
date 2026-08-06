# E2E Test Infra: Torre de Control APS (HealtImpactlab)

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation design.
- Methodology: Category-Partition + BVA + Pairwise + Workload Testing.

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 |
|---|---------|---------------------|:------:|:------:|:------:|
| 1 | GET /api/pacientes (list & filters) | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 2 | POST /api/priorizacion/calcular (NT 118 score) | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 3 | PATCH /api/pacientes/{id}/contraloria (actions) | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 4 | PII SHA-256 Hashing | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 5 | Async Patient Load & Fallback | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 6 | PrioritizedTable Component | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 7 | PatientDetailPanel Component | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 8 | PressureMap Component | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 9 | KPICards Component | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 10 | E2E Live Flow & Calculation Trigger | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 11 | Offline Fallback Resilience | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |

## Test Architecture
- Backend integration tests: `pytest` inside `backend/` (`backend/tests/`)
- Frontend type safety & build check: `npm run build` inside `impact_lab/`
- Full E2E & offline fallback validation script

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Full Contraloría Review & Decision Cycle | F1, F2, F3, F7, F9 | Medium |
| 2 | Offline Fallback Transition & Local Score | F5, F11 | High |
