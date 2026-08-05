# 📚 Marco Metodológico, Prompt Maestro y Guía Técnica de Listas de Espera en Chile (DM2)

Este marco metodológico incluye un **Prompt Maestro** listo para usar en modelos de lenguaje (LLM), junto con la **Guía Técnica de Fundamentos** que responde a las preguntas clave del sistema público de salud chileno.

---

## 1. El Prompt Maestro (para copiar y ejecutar)

```text
Actúa como un Investigador Sénior en Salud Pública, Epidemiología y Gestión Asistencial en Chile. Tu objetivo es estructurar un informe de investigación riguroso y exhaustivo sobre las Listas de Espera en el Sistema Público de Salud (FONASA / Red de Servicios de Salud).

Estructura el documento en los siguientes apartados:

1. MARCO CONCEPTUAL Y TIPOLOGÍA
- Clasificación de listas de espera: GES/AUGE (SIGGES) vs. No GES (SIGTE).
- Subcategorías No GES: Consultas Nuevas de Especialidad (CNE), Intervenciones Quirúrgicas (IQ) y Procedimientos Diagnósticos/Terapéuticos.

2. CRITERIOS DE INCORPORACIÓN Y OPERATORIA DEL REGISTRO
- Proceso de emisión y validación de la Solicitud de Interconsulta (SIC) desde la Atención Primaria de Salud (APS) o nivel secundario.
- Rol de la Contraloría Médica, filtros de pertinencia y causales de rechazo/devolución.
- Funcionamiento del Registro Nacional de Listas de Espera (RNLE) y Norma Técnica N° 118.

3. DINÁMICA DE FLUJO, PRIORIZACIÓN Y EGRESOS
- Algoritmos de priorización: Criterios clínicos, antigüedad, condición oncológica y vulnerabilidad.
- Flujo dinámico del paciente: Agendamiento, suspensión, inasistencias y gestión de contactabilidad.
- Causales normadas de egreso (atención realizada, egreso administrativo, inasistencia justificada/injustificada, rechazo, fallecimiento).

4. CAPÍTULO ESPECIAL: PACIENTES CON DIABETES MELLITUS TIPO 2 (DM2)
- Estatus del paciente DM2: Cobertura GES (Problema N° 13) vs. derivaciones No GES por complicaciones específicas (retinopatía, nefropatía, pie diabético, endocrinología compleja).
- Nudos críticos: Tiempos de latencia entre el Programa de Salud Cardiovascular (PSCV) en APS y la atención secundaria.
- Impacto de la espera en la progresión de la enfermedad y cuellos de botella en exámenes diagnósticos y cirugías vasculares/oftálmicas.

5. FUENTES DE INFORMACIÓN, BASES DE DATOS Y HERRAMIENTAS PÚBLICAS
- Identificación de sistemas primarios: SIGTE, SIGGES, DEIS (series REM y Egresos Hospitalarios).
- Fuentes de libre acceso y transparencia: Visor Ciudadano del MINSAL, Informes Semestrales de Glosa Presupuestaria al Congreso, Portal de Transparencia (Ley 20.285) y compras en Mercado Público para resolución de listas.
- Metodología sugerida para el análisis cuantitativo y cualitativo de los datos.

Asegúrate de utilizar terminología técnica oficial del Ministerio de Salud de Chile (MINSAL), Subsecretaría de Redes Asistenciales y FONASA.
```

---

## 2. Guía Técnica y Marco Conceptual del Sistema Chileno

### Tipos de Listas de Espera en Chile

El sistema de salud chileno divide la espera principalmente según el marco legal y prestacional:

* **Listas de Espera GES (Garantías Explícitas en Salud / Ley 19.966):** Corresponde a las 90 patologías garantizadas por ley. No se mide como "tiempo indeterminado", sino como **Garantías Retrasadas / Incumplidas** cuando se supera el plazo legal de acceso, diagnóstico, tratamiento o seguimiento. Se gestionan mediante el sistema **SIGGES**.
* **Listas de Espera No GES:** Agrupa todas las patologías fuera de la cobertura GES. Se gestionan a través del **SIGTE** (Sistema de Información de Gestión de Tiempos de Espera) e incluyen tres grandes líneas:
  1. **Consultas Nuevas de Especialidad (CNE):** Derivaciones médicas u odontológicas para primera atención en nivel secundario/terciario.
  2. **Intervenciones Quirúrgicas (IQ):** Cirugías electivas programables.
  3. **Procedimientos Diagnósticos y Terapéuticos:** Exámenes de alta complejidad o procedimientos ambulatorios.

```
                    ┌──────────────────────────────────────────────┐
                    │     SISTEMA PÚBLICO DE SALUD EN CHILE        │
                    └──────────────────────┬───────────────────────┘
                                           │
                    ┌──────────────────────┴───────────────────────┐
                    │                                              │
        ▼                                                      ▼
┌──────────────────────────────┐                       ┌──────────────────────────────┐
│       COBERTURA GES          │                       │       COBERTURA NO GES       │
│  (Garantía de Oportunidad)   │                       │   (Gestionado vía SIGTE)     │
└──────────────┬───────────────┘                       └──────────────┬───────────────┘
               │                                                      │
        ▼                                      ┌──────────────────────┼──────────────────────┐
┌──────────────────────────────┐               ▼                      ▼                      ▼
│    Garantías Retrasadas      │      ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│   (Garantizados por Ley)     │      │ Consultas Nuevas │   │  Intervenciones  │   │  Procedimientos  │
└──────────────────────────────┘      │ Especialidad(CNE)│   │ Quirúrgicas (IQ) │   │   Diagnósticos   │
                                      └──────────────────┘   └──────────────────┘   └──────────────────┘
```

---

### Criterios de Incorporación

El ingreso a una lista de espera No GES exige la emisión de una **Solicitud de Interconsulta (SIC)**:

1. **Origen:** Principalmente la Atención Primaria de Salud (CESFAM/CECOSF) mediante el médico tratante, o egreso de Urgencia/Hospitalización.
2. **Filtro de Contraloría Médica:** La SIC es revisada en el nivel secundario (SOME o Unidad de Gestión de la Demanda). Se evalúa la pertinencia clínica. Si falta información o no cumple criterios del protocolo del Servicio de Salud, la SIC es devuelta a la APS.
3. **Registro:** Una vez validada, la SIC ingresa al sistema local e integra el **Registro Nacional de Listas de Espera (RNLE)** / **SIGTE**, marcando la fecha oficial de inicio de la espera.

---

### Flujo de Pacientes, Priorización y Causales de Egreso

#### Priorización

Los criterios estandarizados en la red asistencial combinan:

* **Gravedad clínica y Sospecha Oncológica:** Tienen prioridad absoluta sobre atenciones electivas.
* **Antigüedad:** Medida en días de espera acumulados (se monitorea la mediana de días y el percentil 75/90).
* **Criterios socio-sanitarios:** Edad (adultos mayores, niños), grado de funcionalidad e impacto socioocupacional.

#### Causales de Egreso

Reguladas bajo la **Norma Técnica N° 118 de Registro de Lista de Espera No GES** y resoluciones del MINSAL:

1. **Atención realizada:** El paciente recibe la consulta, procedimiento o cirugía.
2. **Inasistencia / Contactabilidad:** Fracaso documentado tras protocolos de contactabilidad (mínimo 3 intentos en distintos horarios) o inasistencia reiterada a la cita programada.
3. **Rechazo a la atención:** Declaración explícita del usuario de no querer someterse al procedimiento o consulta.
4. **Resolución por otra vía:** Atención efectuada en el sector privado o en otro establecimiento del sistema público.
5. **Egreso Administrativo / Error:** Duplicidad de SIC, error en la digitación o causal clínica que invalida la indicación inicial.
6. **Fallecimiento:** Salida del registro por deceso del paciente (registrado tras cruce con las bases del Registro Civil).

---

### Capítulo Especial: Diabetes Mellitus Tipo 2 (DM2) en Chile

La Diabetes Mellitus Tipo 2 es uno de los principales motores de demanda en la red pública de salud.

#### Dualidad GES vs. No GES

* **Vía GES (Problema N° 13):** La DM2 cuenta con Garantía Explícita para confirmación diagnóstica, tratamiento farmacológico/insulinoterapia y seguimiento continuo dentro del Programa de Salud Cardiovascular (PSCV) en APS.
* **Tránsito a Lista No GES:** Cuando la enfermedad progresa o surgen complicaciones, el paciente debe ser derivado fuera del flujo básico de la APS, ingresando a listas de espera No GES:
  * *Oftalmología:* Retinopatía Diabética (aunque la evaluación anual del fondo de ojo es GES, las complicaciones avanzadas o cirugías de vitrectomía pueden generar cuellos de botella No GES si la garantía vence o se requiere supraespecialidad).
  * *Nefrología:* Enfermedad Renal Crónica avanzada secundaria a nefropatía diabética.
  * *Vascular Periférico / Cirugía:* Evaluación e intervenciones por Pie Diabético (revascularización, aseos quirúrgicos, amputaciones electivas).
  * *Endocrinología / Diabetología:* Para pacientes con multirresistencia metabólica o ajuste de esquemas complejos de insulina.

#### Nudos Críticos y Vicios de Gestión

* **Efecto "Ping-Pong" entre Niveles:** Pacientes derivados a endocrinología que son devueltos a APS por "falta de pertinencia" o SIC mal formulada, perdiendo meses de control.
* **Subdiagnóstico de Complicaciones por Espera:** La tardanza en la consulta de especialidad o en exámenes diagnósticos hace que el paciente regrese al sistema no vía lista de espera, sino descompensado por el Servicio de Urgencia (amputaciones de urgencia, cetoacidosis, falla renal aguda).

---

### Fuentes de Información, Bases de Datos y Herramientas Públicas

| Fuente / Sistema | Tipo de Acceso | Descripción y Contenido |
| --- | --- | --- |
| **SIGTE / RNLE** | Interno MINSAL / Reportes consolidados | Sistema de Información de Gestión de Tiempos de Espera. Microdatos anonimizados accesibles vía Solicitud de Transparencia. |
| **SIGGES** | Interno MINSAL / Reportes consolidados | Sistema de Información para la Gestión de Garantías en Salud. Monitorea el cumplimiento y garantías retrasadas GES. |
| **DEIS (MINSAL)** | **Público (Datos Abiertos)** | Contiene las series **REM (Resumen Estadístico Mensual)**, bases de egresos hospitalarios, defunciones y atenciones de urgencia. |
| **Visor Ciudadano de Tiempos de Espera** | **Público** | Plataforma web del MINSAL con gráficos interactivos sobre medianas de espera y volumen de casos por Servicio de Salud. |
| **Portal del Paciente** | **Público (Personal con ClaveÚnica)** | Permite a cada usuario revisar el estado de sus interconsultas registradas. |
| **Informes de Glosa Presupuestaria** | **Público** | Informes semestrales que la Subsecretaría de Redes Asistenciales rinde ante la Comisión Mixta de Presupuestos del Congreso Nacional. |
| **Portal de Transparencia (Ley 20.285)** | **Público (Bajo solicitud)** | Vía para solicitar bases de datos anonimizadas de interconsultas (fechas de emisión, especialidad, causal de egreso, Servicio de Salud). |
| **Mercado Público** | **Público** | Plataforma de compras del Estado para analizar licitaciones de "Resolución de Listas de Espera" (compras de horas médicas, sociedades de cirugía o días cama a privados). |
