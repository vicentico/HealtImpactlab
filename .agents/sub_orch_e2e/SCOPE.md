# Scope: E2E Testing Track (NT 118 / ECICEP Integration)

## Architecture
- Location: `impact_lab/backend/tests/e2e/`
- Test framework: `pytest` + `httpx` / FastAPI `TestClient`
- Philosophy: Opaque-box requirement-driven testing, independent of internal backend/frontend implementation details.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | FastAPI Backend Core & Scaffolding | Health check, openapi docs, CORS | M_E2E_1 | survey |
| 2 | PII RUT Masking & Privacy Utility | Mask RUT format in DB & API payloads | M_E2E_1 | survey |
| 3 | Bitácora Auditoría Inmutable | Append-only audit trail for contraloría | M_E2E_1 | survey |
| 4 | Motor Priorización NT 118 ($C_1..C_5$) | Weighted score (0-100 pts) calculation | M_E2E_1 | survey |
| 5 | Egresos MINSAL RNLE | Exit causals (1-7) & status transitions | M_E2E_1 | survey |
| 6 | Endpoint `POST /api/priorizacion/calcular` | Calculate NT 118 risk score & breakdown | M_E2E_1 | survey |
| 7 | Endpoint `GET /api/pacientes` | Filtered patient list endpoint | M_E2E_1 | survey |
| 8 | Endpoint `PATCH /api/pacientes/{id}/contraloria` | Contraloría status override & audit log | M_E2E_1 | survey |
| 9 | Boundary & Corner Cases (Tier 2) | HbA1c 11.0/9.0/8.0, VFG 30/45, waiting days, bad RUTs | M_E2E_2 | survey |
| 10 | Cross-Feature Interactions (Tier 3) | Filter + override + audit log + recalculation | M_E2E_3 | survey |
| 11 | Real-World Application Scenarios (Tier 4) | Full patient flow (calc -> inspect -> override -> audit) | M_E2E_4 | survey |
| 12 | Test Suite Publication & Verification | Publish TEST_READY.md and verify suite | M_E2E_5 | survey |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M_E2E_1 | Test Infra & Tier 1 Feature Coverage | Pytest runner/fixtures + ≥5 tests per feature (Backend Health, NT118 Calc, Patient Filtering, Contraloría Override, RUT Masking) | none | IN_PROGRESS |
| M_E2E_2 | Tier 2 Boundary & Corner Cases | HbA1c (11.0, 9.0, 8.0), VFG (30, 45), waiting list limits, malformed/boundary RUTs | M_E2E_1 | PLANNED |
| M_E2E_3 | Tier 3 Cross-Feature Interactions | Sector filter + contraloría override + audit log append + recalculation interaction tests | M_E2E_2 | PLANNED |
| M_E2E_4 | Tier 4 Real-World Application Scenarios | Full end-to-end patient workflow scenarios | M_E2E_3 | PLANNED |
| M_E2E_5 | Test Suite Publication & Handoff | Generate and publish `TEST_READY.md` at project root, handoff to parent | M_E2E_4 | PLANNED |

## Interface Contracts
- Tests located in `impact_lab/backend/tests/e2e/`
- Command to run test suite: `pytest impact_lab/backend/tests/e2e/`
- Output signal: `TEST_READY.md` at `/Users/familia_bustos_estrada/Developer/HealtImpactlab/TEST_READY.md`
