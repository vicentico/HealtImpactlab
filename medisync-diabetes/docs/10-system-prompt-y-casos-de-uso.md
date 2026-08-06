# 10. System prompt del agente principal y casos de uso

## System prompt del agente principal (~1000 caracteres)

La arquitectura real no tiene un unico "agente principal": la orquestacion (que agente llamar y cuando) es
codigo deterministico en `MediSync.Application`, y hay 3 agentes especializados con su propio prompt
(`Manifests/risk-agent.json`, `priority-agent.json`, `scheduler-agent.json` — detalle completo en
[04-agentes-ia.md](04-agentes-ia.md)). De los 3, el **Risk Agent** es el que mas se acerca a "agente
principal": es el primero en ejecutarse sobre cada caso, decide si el caso sigue el flujo normal o se deriva
de urgencia, y calcula el Score de Criticidad Real que despues usa el Priority Agent. Lo que sigue es una
version condensada (~1000 caracteres, estilo campo de formulario con limite de caracteres) de su rol —
pensada para documentacion/presentacion, no un reemplazo del `system_prompt` real y mas extenso que vive en
`risk-agent.json`.

```
Eres el agente de priorizacion clinica de MediSync-Diabetes, copiloto de IA que descomprime listas de espera
de diabeticos derivados desde APS/CESFAM a especialidad en Chile. Tu objetivo es calcular el Score de
Criticidad Real del modelo ECICEP (Severidad 40%, Urgencia_Reciente 25%, Vulnerabilidad 15%, mas
Latencia_Ponderada 20% del tiempo de espera) y sugerir un tier de prioridad P1/P2/P3, justificando el
resultado con los datos clinicos reales (HbA1c, glicemia, VFG, RAC, neuropatia, comorbilidades, vulnerabilidad
sociodemografica). Antes de calcular el score, verificas si el caso cumple un criterio de derivacion urgente
(sospecha IAM/ACV, crisis hiperglicemica con compromiso de conciencia, pie diabetico infectado activo, caida
de VFG mayor a 30%); si lo cumple, derivas el caso de inmediato a un profesional, fuera del flujo normal.
Nunca diagnosticas, prescribes, alteras tratamientos ni egresas a un paciente de la lista de espera: cada
sugerencia requiere aprobacion de un medico o gestor UGD antes de agendar.
```

(1025 caracteres, incluyendo espacios.)

El prompt real en `risk-agent.json` es mas largo y explicito: incluye la formula matematica exacta
(`riskScore = round((0.40×Severidad + 0.25×Urgencia_Reciente + 0.15×Vulnerabilidad) / 0.80)`), el nombre
literal de cada tool que debe invocar (`check_emergency_escalation`, `get_patient_clinical_data`,
`get_reference_ranges`) y el formato JSON exacto de respuesta esperado. Ver el archivo fuente en
`src/MediSync.AI/Manifests/risk-agent.json`.

---

## Casos de uso — que hace el sistema en cada uno

Lista base tomada del prompt maestro (`../claude.md`, seccion "Casos de uso"), marcando honestamente que esta
implementado en esta PoC y que no.

### Registrar Paciente ✅

`POST /api/pacientes` → `RegistrarPacienteCommand`. Crea el `Paciente` con sus datos demograficos (RUN,
nombre, fecha de nacimiento, CESFAM de origen) y sus factores de vulnerabilidad ECICEP (dependencia severa,
ruralidad, determinantes sociales). No dispara ningun agente — es un alta simple.

### Registrar Interconsulta ✅

`POST /api/interconsultas` → `RegistrarInterconsultaCommandHandler`. En una sola request:

1. Agrega un `AntecedenteClinico` nuevo al paciente (HbA1c, glicemia, VFG, RAC, neuropatia, comorbilidades,
   urgencias en 90 dias, alertas clinicas).
2. Crea la `Interconsulta` y el `ListaEsperaItem` (`EnEspera` → `Clasificado`).
3. Publica `CasoClasificadoNotification`, que dispara `CalcularPriorizacionCommand` — el paso siguiente,
   "Calcular riesgo" — de forma desacoplada pero sincrona dentro de la misma request en esta PoC.

### Actualizar antecedentes / Ingresar examenes ⚠️ cubierto parcialmente

No existe un endpoint dedicado a "actualizar" un antecedente existente. Cada `POST /api/interconsultas`
agrega un `AntecedenteClinico` **nuevo** al historial del paciente (`Paciente.Antecedentes` es una lista);
el Risk Agent y `CheckEmergencyEscalationTool` siempre usan el ultimo. Ingresar examenes nuevos para un
paciente ya registrado hoy requiere pasar por una nueva interconsulta, no un endpoint independiente.

### Calcular riesgo ✅

Dentro de `CalcularPriorizacionCommand`: el **Risk Agent** primero invoca `check_emergency_escalation`
(deterministico). Si hay alarma, el caso se marca `DerivacionUrgente` y el flujo automatico termina ahi. Si
no, calcula el Score de Criticidad Real ECICEP ponderado y devuelve `RiskScore`/`RiskLevel` con justificacion
desglosada por factor. Ver [04-agentes-ia.md](04-agentes-ia.md).

### Actualizar prioridad ✅

Mismo command, a continuacion: el **Priority Agent** combina el riesgo, los dias en espera y la carga de la
especialidad, y devuelve `PriorityScore`/`PriorityTier` (P1/P2/P3) con su propia justificacion. Solo corre si
el Risk Agent no derivo el caso de urgencia.

### Consultar estado ✅

`GET /api/lista-espera` (`ListarListaEsperaQuery`, vista resumida con badge de derivacion urgente) y
`GET /api/casos/{id}` (`ObtenerCasoQuery`, trazabilidad completa: datos clinicos, vulnerabilidad, riesgo,
prioridad, agenda, eventos, ejecuciones de agentes y decisiones).

### Revision medica ✅

`PATCH /api/casos/{id}/revision` → `RevisarCasoCommand`. Un medico confirma o ajusta el `PriorityTier`
sugerido por la IA; el origen (`IA` si no hubo cambio, `Humano` si lo hubo) queda en `DecisionLog`. Al
confirmar, dispara el paso siguiente ("Asignar agenda") en la misma request.

### Asignar agenda ✅

Dentro de `RevisarCasoCommand`: el **Scheduler Agent** busca cupos disponibles, reserva el mas adecuado segun
el tier confirmado, y notifica al paciente por un canal simulado (WhatsApp/SMS/Telefono) con una respuesta
simulada (`Confirmado`/`Rechazado`/`SinRespuesta`, proxy del NSP del dossier ECICEP).

### Confirmar cita ✅ (paso "Confirmacion" del flujo minimo del prompt maestro)

`POST /api/casos/{id}/confirmar` → `ConfirmarAgendaCommand`. Transicion determinista `Agendado` →
`Confirmado`, sin agente IA involucrado.

### Registrar atencion ✅

`POST /api/casos/{id}/atender` → `RegistrarAtencionCommand`. Transicion determinista `Confirmado` →
`Atendido`, sin agente IA involucrado.

### Cerrar caso ✅

`POST /api/casos/{id}/cerrar` → `CerrarCasoCommand`. Transicion determinista `Atendido` → `Cerrado`.

### Reingresar paciente ❌ no implementado

No existe endpoint ni command para reingresar un paciente/contrarreferencia formal despues de `Cerrado`.
Listado explicitamente como pendiente en [07-roadmap-futuro.md](07-roadmap-futuro.md), seccion "Cerca de la
base actual".

### Auditar proceso ✅ (transversal, no es un caso de uso propio)

No es una accion que alguien "dispare": cada command handler registra automaticamente `CasoEvento` (timeline),
`AgentExecutionLog` (tool calls, iteraciones, tokens reales de la API de Anthropic) y `DecisionLog` (origen
IA/Humano). Todo queda visible en `GET /api/casos/{id}` y en la pantalla `/casos/:id` del frontend.

---

## Casos de uso agregados en esta PoC (no estaban en la lista del prompt maestro)

- **Derivacion urgente automatica**: descrita arriba, dentro de "Calcular riesgo". Es la adicion mas
  importante del dossier ECICEP sobre el prompt maestro original.
- **Consultar KPIs** ✅: `GET /api/kpis` (`ObtenerKpisQuery`) + pantalla `/kpis`. Agrega casos
  activos/cerrados, derivaciones urgentes, distribucion por prioridad/estado y tasa de NSP sobre los datos ya
  registrados por los demas casos de uso.
