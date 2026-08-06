## 2026-08-05T21:48:00Z

You are worker_1 (teamwork_preview_worker) working on Milestone M3.
Your working directory is: /Users/familia_bustos_estrada/Developer/HealtImpactlab/.agents/worker_m3_1

Please read the following context files before starting:
1. /Users/familia_bustos_estrada/Developer/HealtImpactlab/.agents/ORIGINAL_REQUEST.md
2. /Users/familia_bustos_estrada/Developer/HealtImpactlab/PROJECT.md
3. /Users/familia_bustos_estrada/Developer/HealtImpactlab/.agents/sub_orch_m3/SCOPE.md

Tasks:
1. Build `impact_lab/src/services/api.ts`:
   - Implement `fetchPacientes(sector?: string, status?: string, risk_level?: string, cesfam_name?: string): Promise<Patient[]>`
   - Implement `calcularNT118(payload: PriorizacionRequest): Promise<NT118RiskScore>`
   - Implement `updateContraloriaStatus(patientId: string, payload: { new_status: string; clinical_note: string; physician_name: string; physician_role: string }): Promise<Patient>`
   - Implement robust bidirectional snake_case <-> camelCase mapping between backend schema and frontend `Patient` / `NT118RiskScore` types.
   - Include fallback handling: if fetching from backend API fails (e.g. server offline or network error), fall back to `mockPatients.ts` gracefully, ensuring all filters, calculations, and status updates continue working in fallback mode.
2. Update `impact_lab/src/App.tsx`:
   - Fetch patients asynchronously from `api.ts` on component mount and when CESFAM sector or filter changes.
   - Replace local synchronous state mutations in `handleUpdateStatus` with `updateContraloriaStatus` async service calls.
3. Verify component integration:
   - `PrioritizedTable.tsx`: ensure table renders API patients, filters, search, and status badges cleanly.
   - `PatientDetailPanel.tsx`: ensure detail panel displays score breakdown, active decompensations, and triggers status override via API client.
   - `PressureMap.tsx`: ensure pressure map metrics reflect real patient data.
4. Run verification commands in `impact_lab/`:
   - `npx tsc --noEmit` (MUST pass with 0 errors)
   - `npm run build` (MUST build cleanly)
