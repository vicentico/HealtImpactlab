# 09. Q&A — Limites del agente (que hace, que no hace nunca, cuando deriva)

Registro de una conversacion sobre la seccion "Limites Operativos y Salvaguardas Clinicas del Entregable
Tecnico" del dossier ECICEP (`Proyecto_Priorizacion_Inteligente_ECICEP_ImpactLab.pdf`, pagina 3), y como se
mapea contra el codigo real de esta PoC.

---

## Pregunta 1

> Respecto a los limites del agente: que hace, que no hace nunca y cuando deriva?

### Respuesta

Texto exacto del dossier (pagina 3, tabla "Limites Operativos y Salvaguardas Clinicas del Entregable
Tecnico"):

**Que SI hace**
Analiza fichas clinicas y notas no estructuradas, calcula el Score de Criticidad Real (0-100) segun la
matriz oficial ECICEP, reordena dinamicamente la lista de espera por riesgo clinico, y genera Tarjetas de
Explicabilidad para validacion medica.

**Que NO hace nunca**
No diagnostica por si solo, no prescribe ni altera dosis de medicamentos, no reemplaza la decision clinica,
y nunca egresa a un paciente de la lista de espera sin aprobacion humana del medico o gestor UGD.

**Cuando deriva a profesional**
Deriva de inmediato cuando detecta: sospecha de infarto (IAM) o accidente cerebrovascular (ACV), crisis de
hiperglicemia aguda con compromiso de conciencia, pie diabetico infectado activo, o sospecha de falla renal
acelerada (caida de filtracion glomerular >30%).

### Como se mapea contra el codigo real

Estas salvaguardas no son solo texto del dossier — ya estan implementadas:

| Salvaguarda del dossier                         | Donde vive en el codigo                                                                                                                                    |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Cuando deriva a profesional" (los 4 criterios) | `CheckEmergencyEscalationTool` — chequeo deterministico (no delega en Claude) que el Risk Agent invoca primero (ver [04-agentes-ia.md](04-agentes-ia.md))  |
| "Nunca egresa sin aprobacion humana"            | `RevisarCasoCommand` — la prioridad sugerida por IA siempre pasa por `PATCH /api/casos/{id}/revision` antes de agendar                                     |
| "No reemplaza la decision clinica"              | `DecisionLog.Origen` distingue si el medico confirmo (`IA`) o ajusto (`Humano`) el tier sugerido                                                           |
| "Score de Criticidad Real (0-100)"              | `RiskAgent` con la formula ponderada ECICEP (Severidad/Urgencia_Reciente/Vulnerabilidad), ver [08-analisis-ecicep-prompt.md](08-analisis-ecicep-prompt.md) |
| "Tarjetas de Explicabilidad"                    | La `justificacion` desglosada por factor que devuelve el Risk Agent, visible en `GET /api/casos/{id}`                                                      |

### Brecha conocida

Lo unico que el codigo **no** cubre todavia de "Que SI hace" es analizar _texto libre no estructurado_ (notas
de enfermeria/urgencia) con NLP. Hoy los datos clinicos entran como campos estructurados (`hbA1c`, `vfg`,
`alertasClinicas`, etc.) via `POST /api/interconsultas`, no como texto que el agente interprete. Queda
pendiente en el roadmap (ver [07-roadmap-futuro.md](07-roadmap-futuro.md)).

---

## Pregunta 2

> Cuales tool_use se usan?

### Respuesta

9 tools en total, registradas en `MediSync.AI/DependencyInjection.cs` y repartidas 3 por agente segun el
`tools` array de cada manifiesto en `MediSync.AI/Manifests/*.json`. `AgentLoop` solo expone a Claude el
subconjunto declarado por el manifiesto del agente que se esta ejecutando, no las 9 completas.

**Risk Agent** (`risk-agent.json`)

| Tool | Que hace |
|---|---|
| `check_emergency_escalation` | Chequeo deterministico (no pasa por Claude) de los 4 criterios de derivacion urgente — se llama siempre primero |
| `get_patient_clinical_data` | Trae HbA1c, glicemia, VFG, RAC, neuropatia, urgencias 90d, comorbilidades, vulnerabilidad |
| `get_reference_ranges` | Rangos clinicos de referencia (HbA1c, glicemia, VFG, RAC) |

**Priority Agent** (`priority-agent.json`)

| Tool | Que hace |
|---|---|
| `get_risk_assessment` | Lee el `RiskScore`/`RiskLevel` ya calculado por el Risk Agent |
| `get_waiting_list_stats` | Cuantos pacientes esperan en la misma especialidad |
| `record_decision_log` | Registra la decision final en `DecisionLog` (auditoria) |

**Scheduler Agent** (`scheduler-agent.json`)

| Tool | Que hace |
|---|---|
| `get_available_slots` | Cupos de agenda disponibles para la especialidad |
| `reserve_slot` | Reserva el cupo elegido |
| `notify_dummy_channel` | Simula el aviso al paciente (WhatsApp/SMS/Telefono) + respuesta simulada (NSP) |

Detalle completo por agente (objetivo, entradas/salidas, prompt, memoria, fallback) en
[04-agentes-ia.md](04-agentes-ia.md).
