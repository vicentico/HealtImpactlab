# Original User Request

## 2026-08-05T21:24:20Z

Desarrollo e integración End-to-End del Backend API (Python / FastAPI) y motor de priorización NT 118 / ECICEP integrado con el Frontend React 18 en impact_lab/.

Working directory: /Users/familia_bustos_estrada/Developer/HealtImpactlab/impact_lab
Integrity mode: development

## Requirements

### R1. Engine Backend API (Python / FastAPI)
- Crear el servidor API REST asíncrono con FastAPI y Pydantic en `impact_lab/backend` para la gestión de lista de espera APS, cálculo algorítmico del Puntaje NT 118 ($C_1..C_5$) y causales de egreso MINSAL (RNLE).

### R2. Integración End-to-End con Frontend React
- Conectar los componentes UI de `impact_lab/src/` (`PrioritizedTable.tsx`, `PatientDetailPanel.tsx`, `PressureMap.tsx`) con los endpoints REST del backend, sustituyendo los datos mock por llamadas a la API mediante un cliente de servicio `src/services/api.ts`.

### R3. Privacidad y Persistencia Inmutable
- Implementar enmascaramiento PII de RUT en BD/API y registrar las decisiones de la contraloría médica en la bitácora auditable.

## Acceptance Criteria

### API & Engine Core
- [ ] Servidor FastAPI corriendo con documentación OpenAPI Swagger disponible en `/docs`.
- [ ] Endpoint `POST /api/priorizacion/calcular` retornando el puntaje ponderado NT 118 (0-100 pts) y desglose de subcriterios ($C_1..C_5$).
- [ ] Endpoint `GET /api/pacientes` retornando la lista priorizada filtrable por sector CESFAM y estado.
- [ ] Cliente API `src/services/api.ts` integrado en frontend React.
- [ ] Chequeo estricto de tipos `npx tsc --noEmit` en frontend y compilación sin errores.
