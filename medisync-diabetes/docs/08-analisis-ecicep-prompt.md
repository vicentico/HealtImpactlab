# 08. Análisis del dossier ECICEP (Impact Lab 2026) — Prompt para el roadmap "Cerca de la base actual"

## Por qué existe este documento

La fuente es [`Proyecto_Priorizacion_Inteligente_ECICEP_ImpactLab.pdf`](Proyecto_Priorizacion_Inteligente_ECICEP_ImpactLab.pdf)
(mismo `docs/`): el dossier oficial de postulación a Impact Lab 2026 (Health Solutions), que describe con mucho
mas detalle de negocio, epidemiologico y financiero la misma vision que ya resumia `../claude.md`, con un
elemento nuevo y concreto que en su momento la PoC no implementaba: una formula de priorizacion ponderada
oficial (el "Score de Criticidad Real ECICEP") en vez del razonamiento libre que usaba el Risk Agent.

Este documento hace dos cosas:

1. **Resume** lo esencial del dossier (seccion 1).
2. **Funciono como prompt**: instrucciones accionables, referenciando clases y archivos reales del repo, para
   llevar el roadmap "Cerca de la base actual" de [07-roadmap-futuro.md](07-roadmap-futuro.md) al codigo sin
   reescribir el dominio ni el orquestador (seccion 3).

> **Estado: implementado.** Las 6 tareas de la seccion 3 (3.1-3.6) ya estan en el codigo y verificadas
> end-to-end contra Mongo y la API real de Anthropic, incluyendo el frontend (`/kpis`). Este documento queda
> como registro de analisis y diseño — el estado actual de cada item esta marcado con ✅ en
> [07-roadmap-futuro.md](07-roadmap-futuro.md). La seccion 4 ("Que queda deliberadamente fuera de esta
> iteracion") sigue vigente: MCP real, simulacion Monte Carlo e integraciones reales (SIGTE/RNLE, WhatsApp
> Business API) no se tocaron.

---

## 1. Resumen del dossier ECICEP

### Problema y contexto

- La red publica chilena gestiona las Listas de Espera No GES (SIGTE/RNLE) con **FIFO estricto** (fecha de la
  interconsulta), sin considerar deterioro clinico ni riesgo de descompensacion.
- Para DM2 esto genera un **"efecto dominó"**: un paciente descompensado que espera sin priorizar termina
  colapsando otras 4 especialidades (Nefrologia -> dialisis, Cirugia Vascular -> amputaciones, Oftalmologia ->
  ceguera, Cardiologia/Urgencias -> IAM/ACV).
- Territorio piloto: Servicio de Salud Metropolitano Sur Oriente (SSMSO) / Hospital Dr. Sotero del Rio,
  ~140.000 pacientes DM2 en APS.

### Score de Criticidad Real ECICEP (0-100 puntos)

```
Score ECICEP = (W1 × Severidad) + (W2 × Urgencia_Reciente) + (W3 × Latencia_Ponderada) + (W4 × Vulnerabilidad)
```

| Factor | Peso | Definicion segun el dossier |
|---|---|---|
| Severidad Patologica | W1 = 40% | HbA1c >9% o descompensacion, microalbuminuria/RAC elevado, VFG < 60 ml/min, neuropatia previa |
| Progresion Sintomatica y Urgencias | W2 = 25% | Consultas en SAPU/SAR/UEH por crisis hiperglicemica o sindrome coronario agudo en los ultimos 90 dias |
| Latencia Relativa Ponderada | W3 = 20% | Antiguedad de la interconsulta, ajustada para no postergar indefinidamente a pacientes estables |
| Vulnerabilidad Sociodemografica | W4 = 15% | Edad avanzada, dependencia severa, ruralidad, determinantes sociales registrados en APS |

### Roles (Plataforma "Torre de Control APS")

Jefe de Servicio/UGD (revisa, override clinico, aprueba con 1 clic, genera version auditable) — Equipo Medico
Tratante (ve la lista aprobada, retroalimenta) — Enfermeria (agenda, contacto omnicanal, control de NSP) —
Paciente (recibe citaciones, responde por WhatsApp/SMS via NLP).

### Salvaguardas clinicas explicitas

- **Que SI hace**: analiza texto no estructurado, calcula el Score ECICEP, reordena la lista, genera "Tarjetas
  de Explicabilidad Clinica".
- **Que NO hace nunca**: no diagnostica, no prescribe, no altera dosis, no egresa a un paciente de la lista sin
  aprobacion humana.
- **Cuando deriva de inmediato a un profesional** (fuera del flujo normal de priorizacion): sospecha de
  IAM/ACV, crisis de hiperglicemia con compromiso de conciencia, pie diabetico infectado activo, sospecha de
  falla renal acelerada (caida de VFG >30%).

### Validacion propuesta y metricas objetivo

5 escenarios de simulacion Monte Carlo (Control FIFO, ECICEP puro, Integrado/Copiloto, Estres de red, Ruido de
datos) sobre una cohorte sintetica de 50.000-150.000 pacientes. Metas: latencia G3 de >500 a <60 dias,
-35%/-45% amputaciones, -25%/-35% ingresos a dialisis, -20%/-30% eventos MACE, ahorro ~$1.000M CLP/año por
cada 50 casos de dialisis evitados.

---

## 2. Brecha: que de esto ya cubre la base actual vs que falta

| Elemento del dossier | Estado en el codigo actual | Categoria |
|---|---|---|
| Severidad (HbA1c, glicemia, comorbilidades) | `AntecedenteClinico` (HbA1c, GlicemiaAyunas, Comorbilidades) + `RiskAgent` ya lo evalua | Ya implementado (parcial) |
| Severidad: VFG, microalbuminuria/RAC, neuropatia | `AntecedenteClinico` no tiene estos campos | Cerca (extender el record) |
| Urgencia_Reciente (SAPU/SAR/UEH 90 dias) | No existe ningun campo ni tool para esto | Cerca (nuevo campo + tool) |
| Latencia_Ponderada | Ya existe: `diasEnEspera` se calcula y el Priority Agent lo usa | Ya implementado |
| Vulnerabilidad (edad, dependencia, ruralidad) | Edad ya se deriva de `FechaNacimiento`; dependencia/ruralidad no existen | Cerca (extender `Paciente`) |
| Score ponderado con W1-W4 explicitos | Hoy el Risk/Priority Agent razona libre con Claude, sin formula fija | Cerca (ajustar prompts + reglas) |
| Tarjeta de Explicabilidad Clinica | Ya existe como texto libre (`RiskJustificacion`/`PriorityJustificacion`) | Ya implementado (falta UI dedicada) |
| Override clinico + aprobacion 1 clic con version auditable | Ya existe: `RevisarCasoCommand` + `DecisionLog` + `OrigenDecision` | Ya implementado |
| Derivacion urgente automatica (IAM/ACV/pie diabetico/falla renal acelerada) | No existe ningun mecanismo de escalamiento fuera del flujo normal | Requiere diseño nuevo |
| Canal omnicanal WhatsApp real + reduccion de NSP | Solo existe `NotifyDummyChannelTool` (simulado, sin logica de NSP) | Cerca (extender el tool + regla) |
| KPIs (latencia G3, amputaciones evitadas, ahorro fiscal) | No hay dashboard; los datos crudos (`AgentExecutionLog`, `CasoEvento`) ya se registran | Cerca (queries de agregacion) |
| MCP real (seudonimizacion local antes de llamar a Claude) | Hoy se llama directo a la Anthropic Messages API con `HttpClient` propio, sin MCP | Requiere diseño nuevo |
| Simulacion Monte Carlo / DES con cohorte sintetica 50k-150k | No existe motor de simulacion | Requiere diseño nuevo |

La fila clave es que **la arquitectura de agentes ya soporta este cambio sin rediseño**: `RiskAgent` y
`PriorityAgent` ya son el punto de extension correcto (ver [04-agentes-ia.md](04-agentes-ia.md)); lo que falta
es (a) mas datos de entrada en el dominio y (b) hacer que el calculo siga la formula ponderada oficial en vez
de un puntaje libre, para que sea auditable frente al jurado/paper cientifico citado en el dossier.

---

## 3. El prompt: tareas para implementar el roadmap "Cerca de la base actual" actualizado

Instrucciones para quien (persona o agente) implemente cada item. Cada tarea nombra las clases reales a tocar.

### 3.1 Extender `AntecedenteClinico` con los campos de Severidad y Urgencia_Reciente

- Agregar a `MediSync.Domain/Pacientes/AntecedenteClinico.cs`: `VFG` (double, ml/min), `MicroalbuminuriaRac`
  (double), `NeuropatiaPrevia` (bool), `UrgenciasUltimos90DiasPorHiperglicemiaOSca` (int).
- Propagar los campos nuevos en `RegistrarInterconsultaCommand` (`MediSync.Application/Interconsultas/Commands`)
  y en `dummy-data/pacientes.json` / `DummyDataSeeder` para que el seeder los pueble.

### 3.2 Extender `Paciente` con Vulnerabilidad Sociodemografica

- Agregar a `MediSync.Domain/Pacientes/Paciente.cs`: `DependenciaSevera` (bool), `Ruralidad` (bool),
  `DeterminantesSocialesRegistrados` (`IReadOnlyList<string>`, ej. `["Vive solo", "Bajo ingreso"]`).
- La edad ya existe via `EdadEnAnios()` — no se toca.

### 3.3 Reescribir el prompt del Risk Agent para usar el Score ECICEP ponderado

- Actualizar `MediSync.AI/Manifests/risk-agent.json`: el `system_prompt` debe instruir a Claude a calcular
  explicitamente `Severidad`, `Urgencia_Reciente` y `Vulnerabilidad` (cada uno 0-100) y combinarlos con los
  pesos oficiales (`0.40`, `0.25`, `0.15` — la Latencia con `0.20` la sigue aplicando el Priority Agent, que ya
  la tiene) antes de emitir `riskScore`/`riskLevel`. La justificacion debe citar el desglose por factor, no solo
  un numero final, para que sea la "Tarjeta de Explicabilidad Clinica" que pide el dossier.
- Actualizar `GetPatientClinicalDataTool` (`MediSync.AI/Tools/`) para exponer los campos nuevos de 3.1/3.2 al
  agente.

### 3.4 Agente/regla de derivacion urgente (fuera del flujo normal)

- Nuevo tool `CheckEmergencyEscalationTool` en `MediSync.AI/Tools/`: recibe los datos clinicos y devuelve
  `true`/`false` + motivo si detecta alguno de los 4 criterios del dossier (sospecha IAM/ACV, crisis
  hiperglicemica con compromiso de conciencia, pie diabetico infectado activo, caida de VFG >30%).
- El Risk Agent lo invoca antes de calcular el score; si detecta una alarma, el caso no sigue el flujo normal
  de priorizacion — se emite un evento nuevo (`CasoEvento("DerivacionUrgente", ...)`) y notifica de inmediato
  (reusa `NotifyDummyChannelTool`). Este es el unico punto donde el dossier permite saltarse la revision medica
  estandar, y aun asi requiere que un profesional tome la posta (no auto-resuelve el caso).

### 3.5 KPIs y dashboard alineados a las metas del dossier

- Nuevas `Query` en `MediSync.Application` (ej. `ObtenerKpisQuery`) que agreguen sobre `lista_espera_items` y
  `caso_eventos`: latencia promedio para casos con `RiskLevel=Critico`/`Alto` (proxy de "G3"), tiempo hasta
  clasificacion/priorizacion, casos derivados de urgencia (3.4), distribucion de `PriorityTier`.
- Pantalla Angular nueva en `frontend/medisync-web` que muestre estos KPIs contra las metas del dossier (latencia
  G3 <60 dias, etc.) — sin inventar cifras de impacto clinico real, solo mostrar los datos que la PoC sí mide.

### 3.6 Canal omnicanal y reduccion de NSP (inasistencia)

- Extender `NotifyDummyChannelTool` para registrar el canal (`WhatsApp`/`SMS`/`Telefono`) y simular una
  respuesta (`Confirmado`/`Rechazado`/`SinRespuesta`), quedando en `CasoEvento`.
- Esto es simulado (no hay integracion real de WhatsApp Business API en esta PoC), pero deja el modelo de datos
  listo para medir NSP simulado como proxy del 15,6% que cita el dossier.

### 3.7 Items ya listados en el roadmap que el dossier refuerza sin cambiarlos

- Reingreso de paciente y contrarreferencia formal, mas agentes especializados (Referral/Notification/Audit),
  Angular Material / mas pantallas, escalar dummy data — se mantienen igual que en la version anterior del
  roadmap (ver [07-roadmap-futuro.md](07-roadmap-futuro.md)).

---

## 4. Que queda deliberadamente fuera de esta iteracion

Estos elementos del dossier son reales y estan documentados, pero no son "cerca de la base actual" — quedan en
la seccion "Requiere diseño nuevo" del roadmap, sin prometer fecha:

- **MCP real** (seudonimizacion de datos sensibles en un entorno local antes de razonar con Claude): hoy la
  PoC llama directo a la Anthropic Messages API con `HttpClient` propio (ver
  [rustyhand-analisis.md](rustyhand-analisis.md)); no hay capa de seudonimizacion.
- **Simulacion Monte Carlo / DES** sobre cohortes sinteticas de 50.000-150.000 pacientes: la PoC usa 24
  pacientes dummy reales, no un motor de simulacion de eventos discretos.
- **Integracion real con SIGTE/RNLE y WhatsApp Business API**: todo sigue simulado (dummy data, tools que no
  llaman servicios externos reales), tal como establece el alcance de la PoC en
  [01-vision-y-alcance-poc.md](01-vision-y-alcance-poc.md).
