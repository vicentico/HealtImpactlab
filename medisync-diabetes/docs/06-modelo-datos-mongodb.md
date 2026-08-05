# 06. Modelo de datos MongoDB

## Por que MongoDB (y no relacional) para este dominio

- El caso de uso central — trazabilidad de un caso clinico — es naturalmente **documento-centrico**: un
  `ListaEsperaItem` acumula eventos, ejecuciones de agentes y decisiones a lo largo del tiempo; consultarlo
  completo (`GET /api/casos/{id}`) hoy requiere leer varias colecciones por `ListaEsperaItemId`, pero el
  patron de acceso es siempre "dame todo lo relacionado a este caso", no joins arbitrarios.
- Los `AgentExecutionLog` tienen forma variable por diseño (distintos agentes usan distintas tools, con
  distintos `inputJson`/`outputJson`) — encaja mejor con documentos flexibles que con columnas fijas.
- Preparacion para escala (vision completa: millones de registros): las colecciones de auditoria
  (`caso_eventos`, `agent_execution_logs`, `decision_logs`) son de solo-insercion (append-only) y se
  particionan naturalmente por `ListaEsperaItemId` — un candidato directo a sharding por ese campo si el
  volumen lo exige, sin rediseño.
- Para la PoC se evaluo y descarto in-memory/mock (ver matriz de decision en el plan de implementacion): no
  permite demostrar indices reales ni queda persistente entre reinicios, que es justamente lo que se queria
  mostrar para justificar Mongo en la vision completa.

## Colecciones (`MediSync.Infrastructure.Persistence.MongoContext`)

| Coleccion | Documento (`Infrastructure/Persistence/Documents/`) | Proposito |
|---|---|---|
| `pacientes` | `PacienteDocument` | Datos del paciente + antecedentes clinicos embebidos |
| `interconsultas` | `InterconsultaDocument` | Derivacion desde CESFAM a especialidad |
| `lista_espera_items` | `ListaEsperaItemDocument` | Estado del caso en el flujo (fuente de verdad del `EstadoCaso`) |
| `priorizaciones` | `PriorizacionDocument` | Riesgo + prioridad calculados por IA, y confirmacion medica |
| `agenda_slots` | `AgendaSlotDocument` | Cupos de agenda dummy, disponibles o reservados |
| `caso_eventos` | `CasoEventoDocument` | Timeline de eventos del caso (append-only) |
| `agent_execution_logs` | `AgentExecutionLogDocument` | Cada ejecucion de agente IA, con tool calls y tokens |
| `decision_logs` | `DecisionLogDocument` | Decisiones auditables, con origen IA/Humano |
| `especialidades` | `EspecialidadDocument` | Catalogo (Diabetologia, Endocrinologia) |
| `centros_salud` | `CentroSaludDocument` | Catalogo de CESFAM/Hospitales |
| `profesionales` | `ProfesionalDocument` | Catalogo de profesionales por especialidad/centro |

Todas usan `Id` (string GUID sin guiones, generado por `MediSync.Domain.Common.Entity`) como `_id` de Mongo —
evita el mapeo adicional a `ObjectId` y mantiene el mismo identificador visible en dominio, API y Mongo.

## Documento de ejemplo real (`priorizaciones`)

Capturado durante la verificacion end-to-end (ver [05-flujo-secuencia.md](05-flujo-secuencia.md)):

```json
{
  "_id": "3f1c...",
  "ListaEsperaItemId": "82566e31cd854b6fbc3de98f17c76874",
  "RiskScore": 75,
  "RiskLevel": "Alto",
  "RiskJustificacion": "Paciente de 68 años con diabetes no controlada: HbA1c 9.2% ...",
  "PriorityScore": 85,
  "PriorityTier": "P1",
  "PriorityJustificacion": "RiskLevel Alto (score 75) con descontrol metabolico severo ...",
  "AgenteQueEjecuto": "PriorityAgent",
  "FechaCalculo": { "$date": "2026-08-05T06:07:52.256Z" },
  "TierConfirmado": "P1",
  "ConfirmadaPor": "Dr. Gonzalez",
  "OrigenConfirmacion": "IA",
  "FechaConfirmacion": { "$date": "2026-08-05T06:08:10.000Z" }
}
```

Los enums (`RiskLevel`, `PriorityTier`, `OrigenDecision`, `EstadoCaso`, `TipoCentroSalud`) se guardan como
**string legible** en vez de entero, via `EnumRepresentationConvention(BsonType.String)` registrada en
`MongoConventions.RegisterOnce()` — facilita inspeccionar los datos directamente en `mongosh`/Compass sin
tener que recordar el mapeo entero-enum.

## Indices (`MongoIndexInitializer.EnsureIndexesAsync`)

| Coleccion | Indice | Por que |
|---|---|---|
| `lista_espera_items` | `{ EspecialidadId: 1, Estado: 1 }` | Consulta mas frecuente: contar/listar casos en curso por especialidad (usada por `get_waiting_list_stats` y por la lista de espera del frontend) |
| `lista_espera_items` | `{ PacienteId: 1 }` | Historial de casos de un paciente (reingreso, futuro) |
| `priorizaciones` | `{ ListaEsperaItemId: 1 }` | Lookup 1:1 desde un caso hacia su priorizacion (usado en casi todos los endpoints y tools) |
| `agenda_slots` | `{ EspecialidadId: 1, Disponible: 1, FechaHora: 1 }` | La tool `get_available_slots` necesita "cupos libres de esta especialidad, ordenados por fecha" |
| `agenda_slots` | `{ ListaEsperaItemId: 1 }` | Resolver el cupo asignado a un caso desde el detalle |

Estos son los indices minimos que reflejan los patrones de consulta reales ya implementados — no una lista
aspiracional. Al escalar a millones de registros (vision completa), los candidatos siguientes serian indices
compuestos por `CesfamOrigenId` (reportes por centro) y un indice de texto sobre `Motivo` si se necesitara
busqueda libre.

## Justificacion de por que NO se modelo con documentos gigantes embebidos

Se evaluo embeber `CasoEvento`/`AgentExecutionLog`/`DecisionLog` dentro del propio `ListaEsperaItemDocument`
(un solo documento por caso, sin joins). Se descarto porque:

- Los logs de agentes pueden crecer sin limite conocido (reintentos, futuros agentes adicionales) —
  MongoDB tiene un limite duro de 16MB por documento.
- Se necesita poder insertar un evento/log de forma atomica y barata sin reescribir el documento completo
  del caso (que tambien se actualiza concurrentemente por los command handlers).
- Las consultas de auditoria (`GetByListaEsperaItemIdAsync`) ya son eficientes con el indice
  `{ ListaEsperaItemId: 1 }` — el costo de "una coleccion separada" es bajo y la ganancia en escalabilidad es
  alta.
