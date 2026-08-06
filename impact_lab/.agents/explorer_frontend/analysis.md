# Análisis de Frontend — Torre de Control APS (HealtImpactlab)

**Fecha**: 2026-08-05  
**Autor**: Explorer Frontend Agent  
**Objetivo**: Diagnóstico integral del estado actual del frontend React + TypeScript y detección de brechas respecto a las especificaciones R2 y R3 de `ORIGINAL_REQUEST.md`.

---

## 1. Resumen Ejecutivo de Hallazgos

El código frontend actual en `src/` presenta una base sólida con arquitectura modular en React 18, Tailwind CSS, TypeScript estricto y un cliente API (`src/services/api.ts`) que implementa mapeo bidireccional y fallback local offline (`fallbackPatientsStore`).

Sin embargo, existen **6 brechas críticas y de mediano impacto** frente a los requerimientos R2 y R3 especificados en `ORIGINAL_REQUEST.md`:

1. **KPI Promedio NT 118 ausente en `KPICards.tsx`**: El componente muestra 5 tarjetas (Total, Crítico, Descompensados, Pendientes, Aprobados), omitiendo la métrica de **Promedio de Puntaje NT 118** explícitamente solicitada en R2.
2. **Desglose NT 118 incompleto en `PatientDetailPanel.tsx`**: La especificación exige mostrar los 5 subcriterios de la Norma Técnica 118 (C1 HbA1c, C2 VFG, C3 Complicaciones CV, C4 Determinantes Sociales, C5 Días en Lista de Espera). Actualmente, la interfaz `NT118RiskScore` y el panel sólo incluyen 4 subpuntajes (omitiendo el subpuntaje de Días en Lista de Espera C5).
3. **Discrepancia en Estados de Contraloría Médica**: La API backend espera estados `['APROBADO', 'RECHAZADO', 'DERIVADO', 'PENDIENTE']`, mientras que el tipo `ContraloriaStatus` en frontend utiliza `['PENDIENTE', 'APROBADO', 'REQUIERE_REVISION', 'OBSERVADO']`. Los botones de decisión médica no permiten registrar `RECHAZADO` ni `DERIVADO`.
4. **Falta de Cálculo Dinámico en la Apertura de Ficha (R3 Step 2)**: Al seleccionar un paciente no se gatilla la invocación a `POST /api/priorizacion/calcular` (`calcularNT118`) para actualizar el puntaje con los datos clínicos actuales.
5. **Visualización de Transiciones de Estado en la Bitácora de Auditoría**: La bitácora en `PatientDetailPanel.tsx` muestra la nota y fecha, pero no destaca visualmente el cambio de estado anterior a nuevo (`previousStatus` → `newStatus`).
6. **Fallback de Valores Hardcodeados en `PressureMap.tsx`**: Si el listado de pacientes está vacío o cargando, `PressureMap` retorna un objeto fallback con demanda harcodeada de 24 pacientes para DM2, contraviniendo el criterio de aceptación que exige un cálculo derivado puramente de los datos vivos.

---

## 2. Inspección Detallada por Componente y Módulo

### 2.1. Carga Asíncrona y Store Offline (`src/App.tsx` y `src/services/api.ts`)
- **Estado Actual**: `App.tsx` ejecuta `fetchPacientes()` en `useEffect` al montar y al cambiar de CESFAM. Maneja estados de `loading` (spinner `Loader2`) y `error`.
- **Mecanismo Offline**: En `api.ts`, `fetchPacientes` captura cualquier excepción de red o HTTP y conmuta transparentemente a `fallbackPatientsStore` (inicializado con `INITIAL_MOCK_PATIENTS`). La mutación local actualiza `fallbackPatientsStore` manteniendo la persistencia en memoria.
- **Evaluación**: Cumple con R2 en resiliencia offline.

### 2.2. Tarjetas KPI (`src/components/KPICards.tsx`)
- **Estado Actual**: Calcula reactivamente `totalCount`, `criticalCount`, `highDecompensatedCount`, `pendingContraloriaCount`, `approvedCount`.
- **Brecha Encontrada**: Omitió el cálculo del **Promedio de Puntaje NT 118** (`averageNT118Score`).
- **Solución Necesaria**: Calcular `averageNT118Score = patients.length > 0 ? Math.round(patients.reduce((acc, p) => acc + (p.nt118Risk?.totalScore || 0), 0) / patients.length) : 0` y reemplazar o añadir la tarjeta correspondiente.

### 2.3. Panel de Detalle del Paciente (`src/components/PatientDetailPanel.tsx` & `src/types/patient.ts`)
- **Estado Actual**: Muestra desglose en 4 bloques (HbA1c, Renal, CV, Determinantes), factores de descompensación activos, parámetros biomédicos, formulario de decisión de contraloría y bitácora de auditoría.
- **Brechas Encontradas**:
  1. **Subcriterio C5 Ausente**: Falta `daysScore` (Días en Lista de Espera, 0-10 pts) en `NT118RiskScore` (`types/patient.ts`), `mapBackendScoreToFrontend` (`api.ts`), y en la grilla del desglose de `PatientDetailPanel.tsx`.
  2. **Invocación API al Seleccionar Paciente**: Al abrir la ficha no se llama a `POST /api/priorizacion/calcular` para recalcular el puntaje NT 118 en tiempo real con el backend.
  3. **Estados de Contraloría**: Incompatibilidad de enums con backend (`RECHAZADO` y `DERIVADO` no están disponibles en la UI).

### 2.4. Mapa de Presión Asistencial (`src/components/PressureMap.tsx`)
- **Estado Actual**: Utiliza `useMemo` para computar demanda por programa basándose en el listado de pacientes.
- **Brecha Encontrada**: Posee una rama fallback con valores estáticos (`demandCount: 24` para DM2) cuando `patients` es nulo o vacío. Debe asegurar que siempre compute a partir de los datos recibidos (incluso si 0).

### 2.5. Lista Priorizada (`src/components/PrioritizedTable.tsx`)
- **Estado Actual**: Muestra ranking de prioridad, insignias de riesgo, sector, HbA1c/PA, VFG renal, puntaje total, días en lista de espera y estado de contraloría. Implementa enmascaramiento de RUT por Privacidad por Diseño (`maskRut`).
- **Evaluación**: Excelente nivel de cumplimiento visual. Requiere actualizar insignias de estado para incluir `RECHAZADO` y `DERIVADO`.

---

## 3. Matriz de Brechas y Soluciones Propuestas

| Brecha | Componente / Archivo | Requerimiento Afectado | Solución Propuesta |
| bg-slate-900 | --- | --- | --- |
| 1. Falta Promedio NT 118 | `KPICards.tsx` | R2 (Líneas 57-58) | Agregar tarjeta de Promedio NT 118 recomputada reactivamente. |
| 2. Subscore C5 Ausente | `patient.ts`, `api.ts`, `PatientDetailPanel.tsx` | R2 (Línea 52) & R1 (Líneas 37-38) | Agregar `daysScore` a `NT118RiskScore` y renderizar los 5 subpuntajes en el desglose. |
| 3. Desalineación Estados Contraloría | `patient.ts`, `PatientDetailPanel.tsx`, `PrioritizedTable.tsx` | R1 (Línea 33), R2 (Línea 53), R3 (Línea 65) | Alinear `ContraloriaStatus` para incluir `APROBADO`, `RECHAZADO`, `DERIVADO`, `PENDIENTE` y actualizar botones. |
| 4. Falta Cálculo al Abrir Ficha | `App.tsx` / `PatientDetailPanel.tsx` | R3 (Línea 64-65) | Invocar `calcularNT118(patient)` al seleccionar un paciente en el panel de detalle. |
| 5. Trazabilidad Visual de Bitácora | `PatientDetailPanel.tsx` | R2 (Línea 53), R3 (Línea 100) | Formatear los registros de auditoría mostrando explícitamente `previousStatus -> newStatus`. |
| 6. Hardcode Fallback en Presión | `PressureMap.tsx` | R2 (Línea 55), Criterio Aceptación (Línea 95) | Eliminar fallback hardcodeado de 24 pacientes; derivar dinámicamente siempre. |

---

## 4. Estado de Compilación
- **Comando**: `npm run build` (`tsc -b && vite build`)
- **Resultado**: Exitoso (exit code 0, 0 errores de TypeScript).
