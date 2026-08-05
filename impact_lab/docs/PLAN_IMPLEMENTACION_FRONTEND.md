# Plan de Implementación - Torre de Control APS (Frontend Initialization)

Este documento detalla la arquitectura y estructura propuesta para el frontend de la **Torre de Control APS** (Atención Primaria de Salud) en la subcarpeta `impact_lab/` del repositorio `HealtImpactlab`.

---

## 1. Stack Tecnológico Frontend

- **Lenguaje Base**: TypeScript (Tipado estricto para modelos de pacientes, puntajes de riesgo NT 118, sectores CESFAM y auditoría).
- **UI Framework**: React 18 (Componentes funcionales y hooks reactivos).
- **Estilos**: Tailwind CSS v4 (Tema oscuro-clínico de alta densidad informativa).
- **Iconografía**: Lucide React (`lucide-react`).
- **Bundler & Dev Server**: Vite.

---

## 2. Estructura de Archivos en `impact_lab/`

```text
impact_lab/
├── docs/
│   └── PLAN_IMPLEMENTACION_FRONTEND.md
├── config/
├── src/
│   ├── types/
│   │   └── patient.ts              # Interfaces Patient, NT118RiskScore, Sector, Bitacora
│   ├── data/
│   │   └── mockPatients.ts         # Dataset clínico de prueba APS / CESFAM
│   ├── components/
│   │   ├── Header.tsx              # Barra superior y controles globales
│   │   ├── Sidebar.tsx             # Navegación por módulos
│   │   ├── KPICards.tsx            # KPIs de riesgo y descompensación
│   │   ├── PrioritizedTable.tsx    # Tabla priorizada de pacientes
│   │   ├── PatientDetailPanel.tsx  # Ficha desplegable y ajustes de contraloría
│   │   └── OperationalExplicationPanel.tsx # Panel explicativo del algoritmo
│   ├── index.css                   # Configuración Tailwind CSS v4 (Estética Oscuro-Clínico)
│   ├── App.tsx                     # Ensamblado principal y estado de la app
│   └── main.tsx                    # Punto de entrada React 18
├── index.html                      # HTML base
├── package.json                    # Dependencias y scripts del proyecto
├── tsconfig.json                   # Configuración estricta TypeScript
└── vite.config.ts                  # Configuración de Vite + Tailwind CSS v4
```

---

## 3. Detalle de Módulos y Tipos de Datos

### 3.1 Modelo de Datos Clínicos (`src/types/patient.ts`)
- `Patient`: ID, RUT, nombre, edad, sexo, sector CESFAM, patologías (HTA, DM2, etc.), nivel de riesgo NT 118, estado de descompensación, médico contralor asignado, fecha última atención.
- `NT118RiskScore`: Puntaje algorítmico, factores de ponderación, riesgo cardiovascular/renal.
- `ContraloriaStatus`: Estados de validación (`PENDIENTE`, `APROBADO`, `REQUIERE_REVISION`, `OBSERVADO`).
- `AuditLogEntry`: Trazabilidad de cambios realizados por el médico contralor (fecha, usuario, acción, nota clínica).

### 3.2 Componentes de Interfaz
1. **`Header.tsx`**: Selector de centro APS/CESFAM, contador de pacientes críticos y estado de sincronización.
2. **`Sidebar.tsx`**: Accesos directos a Torre de Control, Matriz NT 118, Bitácora de Contraloría e Importación.
3. **`KPICards.tsx`**: Métricas clave (Pacientes Alto Riesgo, Descompensados, Pendientes Contraloría, Cobertura).
4. **`PrioritizedTable.tsx`**: Tabla interactiva con filtros dinámicos (sector, riesgo, estado), ordenamiento por prioridad algorítmica e indicadores de tendencia.
5. **`PatientDetailPanel.tsx`**: Panel lateral con ficha detallada, historia clínica resumida, factores de riesgo y formulario de acción del médico contralor.
6. **`OperationalExplicationPanel.tsx`**: Explicabilidad de la priorización algorítmica para el equipo clínico.

---

## 4. Plan de Verificación y Despliegue

### Automatizado
- Instalación de dependencias: `npm install` (dentro de `impact_lab/`).
- Chequeo de tipos TypeScript: `npx tsc --noEmit`.
- Build de producción: `npm run build`.

### Manual
- Ejecución del servidor local con `npm run dev`.
- Prueba interactiva de filtros por sector, selección de pacientes, recálculos de riesgo y registro en bitácora.
