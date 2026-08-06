## 2026-08-05T21:45:42Z

You are the Sub-orchestrator for Milestone M3 (Frontend API Client & React Component Integration).
Your working directory is: /Users/familia_bustos_estrada/Developer/HealtImpactlab/.agents/sub_orch_m3

MANDATORY FIRST STEP: Read the files at:
1. /Users/familia_bustos_estrada/Developer/HealtImpactlab/.agents/ORIGINAL_REQUEST.md
2. /Users/familia_bustos_estrada/Developer/HealtImpactlab/PROJECT.md

Your scope (Milestone M3):
1. Build `impact_lab/src/services/api.ts`:
   - Implement `fetchPacientes(sector?: string, status?: string, risk_level?: string, cesfam_name?: string): Promise<Patient[]>`
   - Implement `calcularNT118(payload: PriorizacionRequest): Promise<NT118RiskScore>`
   - Implement `updateContraloriaStatus(patientId: string, payload: { new_status: string; clinical_note: string; physician_name: string; physician_role: string }): Promise<Patient>`
   - Include snake_case <-> camelCase mapping and fallback handling to mock data if backend server is unreachable.
2. Update `impact_lab/src/App.tsx`:
   - Fetch patients asynchronously from `api.ts` on component mount and when CESFAM sector or filter changes.
   - Replace local synchronous state mutations in `handleUpdateStatus` with `updateContraloriaStatus` async service calls.
3. Verify component integration:
   - `PrioritizedTable.tsx`: ensure table renders API patients, filters, search, and status badges cleanly.
   - `PatientDetailPanel.tsx`: ensure detail panel displays score breakdown, active decompensations, and triggers status override via API client.
   - `PressureMap.tsx`: ensure pressure map metrics reflect real patient data.
4. Run verification commands inside `impact_lab/`:
   - `npx tsc --noEmit` (MUST pass with 0 errors)
   - `npm run build` (MUST build cleanly)

Orchestrator Workflow:
You are an orchestrator for M3 scope! Follow the iteration loop:
1. Create `SCOPE.md` in your working directory.
2. Dispatch Worker (`teamwork_preview_worker`) to implement code & run verification. MANDATORY WARNING: DO NOT CHEAT. All implementations must be genuine.
3. Dispatch Reviewer (`teamwork_preview_reviewer`) and Challenger (`teamwork_preview_challenger`) to verify component integration and TypeScript checks.
4. Dispatch Forensic Auditor (`teamwork_preview_auditor`) to run forensic integrity audit.
5. Evaluate gate criteria. If pass, write your report to `/Users/familia_bustos_estrada/Developer/HealtImpactlab/.agents/sub_orch_m3/handoff.md` and report DONE to parent orchestrator.

Remember:
- Keep state files updated (`progress.md`, `BRIEFING.md`, `GATE_STATUS.md`).
- Pass path to ORIGINAL_REQUEST.md to all subagents.
