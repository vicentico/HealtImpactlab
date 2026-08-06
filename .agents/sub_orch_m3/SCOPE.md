# Scope: Milestone M3 (Frontend API Client & React Component Integration)

## Architecture
- Frontend: React 18 + TypeScript 5 + Vite + Tailwind CSS v4 in `impact_lab/`
- Communication: Client `src/services/api.ts` making async requests to FastAPI backend (or fallback to local mock data when unreachable).
- State: `App.tsx` async state management replacing local synchronous state mutations.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 9 | Frontend API Client `src/services/api.ts` | Async fetch client replacing mock data with backend API calls, snake_case <-> camelCase mapping & mock fallback | M3 | survey |
| 10 | Integración UI `PrioritizedTable.tsx` | Connect table to API backend for searching, filtering, and data display | M3 | survey |
| 11 | Integración UI `PatientDetailPanel.tsx` | Connect detail panel to API backend for score breakdown & status override | M3 | survey |
| 12 | Integración UI `PressureMap.tsx` | Connect pressure map to real-time capacity and demand metrics from backend | M3 | survey |

## Sub-tasks Breakdown
1. **API Client Implementation (`src/services/api.ts`)**:
   - `fetchPacientes(sector?: string, status?: string, risk_level?: string, cesfam_name?: string): Promise<Patient[]>`
   - `calcularNT118(payload: PriorizacionRequest): Promise<NT118RiskScore>`
   - `updateContraloriaStatus(patientId: string, payload: { new_status: string; clinical_note: string; physician_name: string; physician_role: string }): Promise<Patient>`
   - Include bidirection snake_case <-> camelCase field transformers.
   - Fallback handling: catch network errors when backend is down/unreachable and fallback gracefully to mock data.

2. **App State Migration (`src/App.tsx`)**:
   - Asynchronous `useEffect` fetching on mount and when filter criteria change (sector, status, risk_level, cesfam_name).
   - Async `handleUpdateStatus` calling `updateContraloriaStatus` from `api.ts` and updating state with returned patient object.

3. **Component UI Verification & Refinement**:
   - `PrioritizedTable.tsx`: Verify smooth rendering of patients, search filtering, sector filtering, and status badge updates.
   - `PatientDetailPanel.tsx`: Display NT 118 score breakdown, active decompensations, and trigger status updates through `api.ts`.
   - `PressureMap.tsx`: Compute and display accurate capacity and demand metrics from loaded patient data.

4. **TypeScript & Build Verification**:
   - Run `npx tsc --noEmit` inside `impact_lab/` (0 errors required).
   - Run `npm run build` inside `impact_lab/` (clean build required).

## Code Layout Boundaries
- Owned files for M3:
  - `impact_lab/src/services/api.ts` (new/updated)
  - `impact_lab/src/App.tsx` (updated)
  - `impact_lab/src/components/PrioritizedTable.tsx` (verified/updated if needed)
  - `impact_lab/src/components/PatientDetailPanel.tsx` (verified/updated if needed)
  - `impact_lab/src/components/PressureMap.tsx` (verified/updated if needed)
  - `impact_lab/src/types/patient.ts` (if type adjustments needed)
