# 📋 Documento de Arquitectura y Especificación del Proyecto - HealtImpactlab

## 1. Visión General del Proyecto

* **Nombre Conceptual:** Herramienta de IA para la Repriorización Inteligente de Listas de Espera en Diabetes Mellitus Tipo 2 (DM2) / Torre de Control APS.
* **Contexto:** Sistema Público de Salud de Chile (red asistencial alineada con normativa MINSAL / CESFAM).
* **Objetivo Principal:** Rediseñar y optimizar la gestión de listas de espera de DM2 e intrahospitalarias integrando datos del Ministerio de Salud (MINSAL) mediante un motor de Inteligencia Artificial guiado por criterios GES, parámetros clínicos y variables sociodemográficas (NT 118).
* **Impacto Esperado:**
  1. **Reducción de tiempos de espera** en pacientes de mayor riesgo clínico.
  2. **Disminución de complicaciones graves** asociadas a la patología (daño renal, pie diabético, retinopatías, eventos cardiovasculares).
  3. **Eficiencia operativa** en la asignación de recursos y capacidad asistencial de los establecimientos de salud.

---

## 2. Definición de Usuarios y Funcionalidades (Matriz de Roles)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FLUJO DE USUARIOS EN LA PLATAFORMA              │
├───────────────────┬───────────────────┬───────────────────┬────────────┤
│ 1. JEFE SERVICIO   │ 2. EQUIPO MÉDICO  │ 3. ENFERMERÍA     │ 4. PACIENTE│
│   (Validación y   │   (Ajuste Clínico │   (Gestión y      │   (Receptor│
│    Aprobación)    │   y Sincro)       │    Contactabilidad)│    Final)  │
└─────────┬─────────┴─────────┬─────────┴─────────┬─────────┴────────────┘
          │                   │                   │
          ▼                   ▼                   ▼
```

### 1. Jefe de Servicio (Administrador Clínico y Aprobador)

* **Alcance/Corte de Tiempo:** Selecciona la ventana temporal a analizar (1 semana, 1 mes o lista de espera completa).
* **Visualización Comparativa:** Analiza el estado actual de la lista vs. la propuesta de reestructuración generada por la IA.
* **Trazabilidad y Ficha Electrónica:** Acceso directo mediante enlaces a la ficha clínica/historial del paciente para verificar su contexto.
* **Ajuste Manual (Override Clínico):** Capacidad de mover pacientes hacia arriba o abajo en la lista según su juicio médico profesional.
* **Aprobación y Versionado:** Al dar el "OK", se aprueba la propuesta y se impacta la base de datos oficial, **generando una nueva versión auditable** de la lista de espera.

### 2. Equipo Médico (Especialistas / Médicos Tratantes / Contralores)

* **Visualización de Ajustes:** Revisa la lista repriorizada y aprobada por el Jefe de Servicio.
* **Segunda Validación:** Aporta retroalimentación o solicita ajustes adicionales específicos de sus pacientes asignados.
* **Integración con Agenda:** Sincronización directa de la nueva lista de pacientes con su agenda de atención médica semanal o mensual.

### 3. Equipo de Enfermería (Gestión de Contacto y Agendamiento)

* **Administración de Contactos:** Gestiona el agendamiento siguiendo el orden estricto de la lista repriorizada.
* **Omnicanalidad:** Contacto a través de canales institucionales (Teléfono, Correo Electrónico, WhatsApp, etc.).
* **Procesamiento de Respuestas mediante IA:** Clasificación automática del estado del paciente (*Confirmado*, *Rechazado*, *Sin respuesta*).
* **Motor de Reglas de Agendamiento:**
  * *Ventanas mínimas/máximas de agendamiento:* Tiempos límite permitidos para citar a un paciente.
  * *Límite de cancelación:* Tiempos máximos permitidos antes de la cita para cancelar o reasignar el cupo a otro paciente de la lista.

### 4. Paciente (Usuario Final / Interacción Indirecta)

* **Recepción de Comunicaciones:** Recibe notificaciones y recordatorios automáticos por el canal definido.
* **Respuesta Simplificada:** Interactúa mediante respuestas simples que el sistema procesa automáticamente para actualizar su estatus.

---

## 3. Módulos y Recursos Requeridos del Sistema

### A. Motor de Priorización ("Centro de Criterios")

Es el núcleo lógico del sistema que procesa las variables para calcular el *Score* de prioridad de cada paciente:

1. **Criterios GES:** Plazos legales de oportunidad, garantías de diagnóstico/tratamiento.
2. **Criterios Clínicos:** Niveles de HbA1c, comorbilidades (hipertensión, enfermedad renal, etc.), tiempo en lista de espera, descompensaciones recientes (NT 118).
3. **Criterios Social/Contextual:** Determinantes sociales de la salud, ruralidad, vulnerabilidad, edad.
4. **Base de Evidencia Científica:** Algoritmos guiados por guías de práctica clínica nacional e internacional.

### B. Capa de Datos e Integración (Fuentes MINSAL y Locales)

* Base de datos de listas de espera (SIGTE / Locales).
* Base de datos de historias clínicas / Ficha Electrónica.
* Base de datos demográfica y contextualmente relevante.
* Módulo de ingesta de datos del Ministerio de Salud (MINSAL).

### C. Módulo de Gestión de Capacidad Asistencial

* Configuración de la capacidad operativa del centro (número de boxes, horas médicas disponibles, rendimiento por hora, oferta de horas de enfermería).

### D. Sistema de Trazabilidad, Auditoría y Versionado

* Registro inmutable de cada cambio realizado (quién movió a un paciente, cuándo y por qué).
* Versionado continuo de las bases de datos de listas de espera post-aprobación.

### E. Infraestructura de Software (Frontend & Backend)

* **Frontend:** Interfaz web para Torre de Control APS, Jefe de Servicio, Equipo Médico y Enfermería con dashboards analíticos intuitivos.
* **Backend & Pipeline de IA:**
  * Motor de procesamiento e ingesta de datos.
  * Modelo de IA para reestructuración de listas.
  * Agente / Motor NLP de procesamiento de respuestas de pacientes (WhatsApp/Email).
  * API de integración con sistemas de agenda y fichas clínicas.

---

## 4. Flujo Operativo de la Información (Workflow)

```
[ Ingesta de Datos MINSAL / Locales ]
                 │
                 ▼
[ "Centro de Criterios" + IA de Priorización ]
                 │
                 ▼
[ Propuesta de Lista de Espera Reestructurada ]
                 │
                 ▼
[ Revisión, Edición y Aprobación (Jefe de Servicio / Médico Contralor) ] ──► (Genera Nueva Versión BD)
                 │
                 ▼
[ Segunda Validación & Sincronización con Agenda (Equipo Médico) ]
                 │
                 ▼
[ Contacto Omnicanal & Asignación de Citas (Enfermería + IA) ]
                 │
                 ▼
[ Notificación y Respuesta Automática (Paciente) ] ──► [ Actualización de Estatus ]
```

---

## 5. Subproyectos

### 🚀 impact_lab
Ubicación: `./impact_lab`

Subproyecto principal dedicado al desarrollo de soluciones, prototipos y entregables para **Impact Lab / Torre de Control APS**.

#### Estructura de carpetas
- `impact_lab/src`: Código fuente del frontend (Vite + React 18 + TypeScript + Tailwind CSS v4) y módulos ejecutable.
- `impact_lab/docs`: Documentación técnica y planes de implementación (`PLAN_IMPLEMENTACION_FRONTEND.md`).
- `impact_lab/config`: Archivos de configuración del entorno.

---

## 6. Índice de Documentación Técnica y Metodológica

El repositorio cuenta con los siguientes marcos conceptuales y especificaciones técnicas:

* [**`IMPACTO_REPRIORIZACION_LISTAS_ESPERA_DM2.md`**](file:///Users/franciscobustos/Library/CloudStorage/OneDrive-UniversidadCatólicadeChile(2)/Escritorio/Desafio Claude/HealtImpactlab/IMPACTO_REPRIORIZACION_LISTAS_ESPERA_DM2.md): **Impacto Asistencial, Epidemiológico y Económico** de la repriorización (contexto SSMSO y Hospital Sótero del Río, reducciones proyectadas en amputaciones, diálisis, IAM, ACV y ceguera con su sustento científico).
* [**`ECICEP_MODELO_TECNICO_OPERATIVO.md`**](file:///Users/franciscobustos/Library/CloudStorage/OneDrive-UniversidadCatólicadeChile(2)/Escritorio/Desafio Claude/HealtImpactlab/ECICEP_MODELO_TECNICO_OPERATIVO.md): Modelo Técnico-Operativo para la Gestión de Multimorbilidad y DM2 en Chile.
* [**`EPIDEMIOLOGIA_GOBERNANZA_LISTAS_ESPERA_CHILE.md`**](file:///Users/franciscobustos/Library/CloudStorage/OneDrive-UniversidadCatólicadeChile(2)/Escritorio/Desafio Claude/HealtImpactlab/EPIDEMIOLOGIA_GOBERNANZA_LISTAS_ESPERA_CHILE.md): Marco de Epidemiología, Gobernanza y Gestión Asistencial de Listas de Espera en Chile.
* [**`GUIA_MAESTRA_MANEJO_DM2_CHILE.md`**](file:///Users/franciscobustos/Library/CloudStorage/OneDrive-UniversidadCatólicadeChile(2)/Escritorio/Desafio Claude/HealtImpactlab/GUIA_MAESTRA_MANEJO_DM2_CHILE.md): Guía Maestra Interdisciplinaria y Algoritmo Estratificado para el Manejo Integral de DM2.
* [**`ESPECIFICACION_BASES_DATOS_Y_FUENTES.md`**](file:///Users/franciscobustos/Library/CloudStorage/OneDrive-UniversidadCatólicadeChile(2)/Escritorio/Desafio Claude/HealtImpactlab/ESPECIFICACION_BASES_DATOS_Y_FUENTES.md): Especificación de Bases de Datos Sintéticas y Fuentes Oficiales MINSAL.

