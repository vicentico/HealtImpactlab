# Master Implementation Plan — Torre de Control APS (HealtImpactlab)

## Overview
Fullstack E2E implementation of Torre de Control APS, a clinical priority management platform for Chilean Primary Healthcare (APS) implementing the MINSAL NT 118 scoring algorithm for DM2 / cardiovascular patients.

## Phased Approach

### Phase 0: Survey & Discovery (Current)
- Dispatch Explorers and Spec Miner to analyze existing codebase:
  - Backend: `backend/app/`, `backend/tests/`
  - Frontend: `src/`, `src/types/patient.ts`, `src/services/api.ts`, `src/data/mockPatients.ts`, `src/App.tsx`
- Aggregate findings into `PROJECT.md` (Feature Inventory, Architecture, Code Layout, Interface Contracts).

### Phase 1: Implementation Track & E2E Testing Track Setup
- **Implementation Track**:
  - Milestone R1: Backend FastAPI REST API & NT118 engine implementation + unit/integration tests
  - Milestone R2: Frontend React full dashboard integration (App, PrioritizedTable, PatientDetailPanel, PressureMap, KPICards)
  - Milestone R3: E2E Integration & offline fallback store
  - Milestone R4: E2E Test Suite pass & adversarial coverage hardening
- **E2E Testing Track**:
  - Parallel track to generate comprehensive opaque-box E2E test suite (Tiers 1-4) and publish `TEST_READY.md`.

### Phase 2: Execution & Gating Loop
- For each milestone:
  1. Dispatch 3 Explorers (or Spec Miner) to specify implementation details / plan.
  2. Dispatch Worker to implement changes, run builds & unit tests.
  3. Dispatch 2 Reviewers independently to audit code quality, correctness, and architecture.
  4. Dispatch 2 Challengers for empirical testing.
  5. Dispatch 1 Forensic Auditor for integrity verification.
  6. Evaluate gate criteria in `GATE_STATUS.md`.

### Phase 3: Verification & Completion
- Final E2E pass, verify 0 TypeScript errors, zero runtime errors, 100% E2E test suite pass, clean audit.
- Report completion back to parent/Sentinel.
