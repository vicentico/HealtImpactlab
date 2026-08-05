# 04. Agentes IA

Se implementaron 3 de los 9 agentes descritos en el prompt maestro — los suficientes para demostrar el valor
central (priorizacion inteligente) sin sobreingenieria. Revision medica, atencion y cierre son transiciones
deterministas en `MediSync.Application`, no agentes con su propio prompt.

Cada agente es una clase en `MediSync.AI/Agents/` que implementa una interfaz definida en
`MediSync.Application.Abstractions` (`IRiskAgent`, `IPriorityAgent`, `ISchedulerAgent`), construye un mensaje
de usuario con el contexto del caso, y delega en `AgentLoop` (ver [05-flujo-secuencia.md](05-flujo-secuencia.md)
para el detalle del tool-use loop). El manifiesto de cada agente (modelo, system prompt, tools permitidas)
vive en `MediSync.AI/Manifests/*.json` — el equivalente en C# al `agent.toml` de RustyHand.

---

## Risk Agent

| Campo | Detalle |
|---|---|
| **Objetivo** | Estimar el riesgo clinico de un paciente diabetico derivado, a partir de datos objetivos. |
| **Responsabilidades** | Comparar HbA1c y glicemia en ayunas contra rangos de referencia; considerar comorbilidades y edad. |
| **Entradas** | `pacienteId`, `listaEsperaItemId` (el mensaje inicial incluye nombre y edad; el resto lo obtiene via tools). |
| **Salidas** | `RiskScore` (0-100), `RiskLevel` (`Bajo`/`Medio`/`Alto`/`Critico`), justificacion en texto libre. |
| **Prompt** | `Manifests/risk-agent.json` — exige responder al final con un unico objeto JSON `{riskScore, riskLevel, justificacion}`. |
| **Herramientas** | `get_patient_clinical_data`, `get_reference_ranges` |
| **Memoria** | Ninguna entre ejecuciones (cada llamada es autocontenida); el resultado persiste en `Priorizacion.RiskScore/RiskLevel/RiskJustificacion`. |
| **Eventos** | Ninguno propio; el orquestador (`CalcularPriorizacionCommand`) registra `CasoEvento` despues. |
| **Metricas** | `AgentExecutionLog.Iteraciones/TokensEntrada/TokensSalida`. |
| **Errores/Fallback** | Si Anthropic responde error (401/429/5xx), `AnthropicApiException` se propaga hasta el endpoint como HTTP 502 — no hay fallback silencioso a un valor por defecto. |
| **Cubre** | Clasificado -> (mitad de) Priorizado. |

## Priority Agent

| Campo | Detalle |
|---|---|
| **Objetivo** | Calcular la prioridad final de agenda combinando riesgo, tiempo de espera y carga de la especialidad. |
| **Entradas** | `listaEsperaItemId`, `especialidadId`, dias en espera (en el mensaje inicial). |
| **Salidas** | `PriorityScore` (0-100), `PriorityTier` (`P1`/`P2`/`P3`), justificacion. |
| **Prompt** | `Manifests/priority-agent.json` — incluye reglas de negocio explicitas (riesgo Alto/Critico + espera >30 dias tiende a P1, etc.) y exige registrar la decision antes de responder. |
| **Herramientas** | `get_risk_assessment`, `get_waiting_list_stats`, `record_decision_log` |
| **Memoria** | Ninguna entre ejecuciones. Lee el resultado del Risk Agent desde Mongo (no desde memoria en proceso) — esto es intencional: cada agente es independiente y solo confia en el estado persistido. |
| **Eventos** | Escribe su propio `DecisionLog` via la tool `record_decision_log` (origen `IA`). |
| **Metricas** | `AgentExecutionLog` propio, separado del Risk Agent. |
| **Errores/Fallback** | Igual que Risk Agent: sin fallback silencioso. |
| **Cubre** | (segunda mitad de) Priorizado -> alimenta Revision medica. |

## Scheduler Agent

| Campo | Detalle |
|---|---|
| **Objetivo** | Asignar el cupo de agenda mas adecuado una vez que la prioridad fue revisada/confirmada por un medico. |
| **Entradas** | `listaEsperaItemId`, `especialidadId`, tier de prioridad confirmado (`Priorizacion.TierConfirmado` o, si no hubo ajuste, `PriorityTier`). |
| **Salidas** | `AgendaSlotId` reservado, justificacion de por que ese cupo. |
| **Prompt** | `Manifests/scheduler-agent.json` — instruye priorizar el cupo mas proximo para P1, y dejar margen para P1 futuros al elegir cupos para P2/P3. |
| **Herramientas** | `get_available_slots`, `reserve_slot`, `notify_dummy_channel` |
| **Memoria** | Ninguna. |
| **Eventos** | El orquestador (`RevisarCasoCommand`) registra `CasoEvento("Agendado", ...)` despues de que el agente reserva el cupo. |
| **Metricas** | `AgentExecutionLog` propio. |
| **Errores/Fallback** | Si el agente "reserva" un slot que ya no existe (carrera entre llamadas), el handler lanza `InvalidOperationException` (HTTP 400) en vez de continuar con datos inconsistentes. |
| **Cubre** | Agenda -> Confirmacion (la confirmacion en si es un endpoint determinista). |

---

## Por que no hay Coordinator/Supervisor/Notification/Audit/Referral agents en la PoC

El prompt maestro lista 9 agentes posibles. Para esta PoC:

- **Referral** (derivacion): es determinista — `RegistrarInterconsultaCommandHandler` crea la interconsulta y
  clasifica el caso sin necesitar razonamiento de un LLM.
- **Notification**: se simula con la tool `notify_dummy_channel` dentro del Scheduler Agent, no como agente
  separado (no hay decision que tomar, solo un side-effect simulado).
- **Audit**: la auditoria es un efecto transversal (`CasoEvento`, `DecisionLog`, `AgentExecutionLog`)
  registrado por los command handlers, no un agente que revisa despues.
- **Coordinator/Supervisor**: en esta PoC la orquestacion (que agente llamar y cuando) es codigo determinista
  en `MediSync.Application` (los command handlers y `CasoClasificadoNotification`), inspirado en el patron de
  orquestacion de RustyHand pero sin necesitar que un LLM decida el orden — el orden del flujo clinico ya es
  conocido de antemano. Agregar un Coordinator-agente tendria sentido si el flujo necesitara *decidir*
  dinamicamente el siguiente paso (por ejemplo, saltarse revision medica automatica para P3 de bajo riesgo);
  eso queda en el roadmap.
