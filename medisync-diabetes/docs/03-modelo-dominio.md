# 03. Modelo de dominio

Subconjunto del modelo DDD completo (ver `../claude.md`), acotado a lo necesario para el flujo minimo de la
PoC. Namespace raiz: `MediSync.Domain`.

```mermaid
classDiagram
    class Paciente {
        +string Id
        +string Run
        +string Nombre
        +DateTime FechaNacimiento
        +string CesfamOrigenId
        +List~AntecedenteClinico~ Antecedentes
        +EdadEnAnios() int
        +RegistrarAntecedente(a)
        +UltimoAntecedente() AntecedenteClinico
    }

    class AntecedenteClinico {
        <<record / value object>>
        +double HbA1c
        +double GlicemiaAyunas
        +IReadOnlyList~string~ Comorbilidades
        +DateTime FechaRegistro
    }

    class Interconsulta {
        +string Id
        +string PacienteId
        +string EspecialidadId
        +string CesfamOrigenId
        +DateTime FechaDerivacion
        +string Motivo
        +EstadoInterconsulta Estado
        +MarcarDerivada()
        +DiasDesdeDerivacion() int
    }

    class ListaEsperaItem {
        +string Id
        +string InterconsultaId
        +string PacienteId
        +string EspecialidadId
        +EstadoCaso Estado
        +DateTime FechaIngreso
        +TransicionarA(nuevoEstado) Result
        +DiasEnEspera() int
    }

    class Priorizacion {
        +string Id
        +string ListaEsperaItemId
        +int RiskScore
        +RiskLevel RiskLevel
        +string RiskJustificacion
        +int PriorityScore
        +PriorityTier PriorityTier
        +string PriorityJustificacion
        +string AgenteQueEjecuto
        +DateTime FechaCalculo
        +PriorityTier? TierConfirmado
        +string? ConfirmadaPor
        +OrigenDecision? OrigenConfirmacion
        +RegistrarRiesgo(...)
        +RegistrarPrioridad(...)
        +ConfirmarRevisionMedica(tier, aprobadoPor)
    }

    class AgendaSlot {
        +string Id
        +string ProfesionalId
        +string CentroSaludId
        +string EspecialidadId
        +DateTime FechaHora
        +bool Disponible
        +string? ListaEsperaItemId
        +Reservar(listaEsperaItemId) bool
    }

    class CasoEvento {
        +string Id
        +string ListaEsperaItemId
        +string TipoEvento
        +string Descripcion
        +DateTime Timestamp
    }

    class AgentExecutionLog {
        +string Id
        +string ListaEsperaItemId
        +string AgenteNombre
        +string Input
        +string Output
        +List~ToolCallRecord~ ToolCalls
        +int Iteraciones
        +int TokensEntrada
        +int TokensSalida
        +string CorrelationId
        +DateTime Timestamp
    }

    class DecisionLog {
        +string Id
        +string ListaEsperaItemId
        +string Decision
        +string Justificacion
        +OrigenDecision Origen
        +string Autor
        +DateTime Timestamp
    }

    class Especialidad { +string Id +string Nombre }
    class CentroSalud { +string Id +string Nombre +TipoCentroSalud Tipo }
    class Profesional { +string Id +string Nombre +string EspecialidadId +string CentroSaludId }

    Paciente "1" o-- "*" AntecedenteClinico
    Paciente "1" --> "*" Interconsulta : PacienteId
    Interconsulta "1" --> "1" ListaEsperaItem : InterconsultaId
    ListaEsperaItem "1" --> "0..1" Priorizacion : ListaEsperaItemId
    ListaEsperaItem "1" --> "0..1" AgendaSlot : ListaEsperaItemId
    ListaEsperaItem "1" --> "*" CasoEvento : ListaEsperaItemId
    ListaEsperaItem "1" --> "*" AgentExecutionLog : ListaEsperaItemId
    ListaEsperaItem "1" --> "*" DecisionLog : ListaEsperaItemId
    Profesional "*" --> "1" Especialidad
    Profesional "*" --> "1" CentroSalud
    AgendaSlot "*" --> "1" Profesional
```

## Maquina de estados de `ListaEsperaItem`

`EstadoCaso` es una secuencia estrictamente lineal (ver `ListaEsperaItem.TransicionesPermitidas`):

```mermaid
stateDiagram-v2
    [*] --> EnEspera
    EnEspera --> Clasificado
    Clasificado --> Priorizado : RiskAgent + PriorityAgent (IA)
    Priorizado --> EnRevision : Revision medica
    EnRevision --> Agendado : SchedulerAgent (IA)
    Agendado --> Confirmado
    Confirmado --> Atendido
    Atendido --> Cerrado
    Cerrado --> [*]
```

Cualquier intento de transicion fuera de esta secuencia devuelve `Result.Failure` en vez de lanzar una
excepcion (p.ej. no se puede confirmar un caso que aun esta `EnEspera`).

## Notas de diseño

- **Enums en vez de tablas de catalogo para estados**: `EstadoCaso`, `RiskLevel`, `PriorityTier`,
  `OrigenDecision` son enums C# — para una PoC evita una capa de configuracion extra; si el catalogo de
  estados necesitara cambiar en runtime (multi-tenant, distintos protocolos por region), se migrarian a
  colecciones de referencia en Mongo.
- **`PriorityTier.P1` es el valor `0` del enum** — esto genero un bug real durante el desarrollo: un caso
  cuyo pipeline de IA fallo a medio camino (antes de calcular la prioridad) se veia con `PriorityTier=P1` por
  el valor por defecto, en vez de "sin priorizar". Se corrigio en la capa de consulta
  (`ListarListaEsperaQuery`/`ObtenerCasoQuery`), que ahora solo expone el tier cuando el `ListaEsperaItem`
  efectivamente alcanzo el estado `Priorizado` o posterior. Ver [05-flujo-secuencia.md](05-flujo-secuencia.md)
  para el detalle de por que esto importa en la demo.
- **`AntecedenteClinico` y `ToolCallRecord` son `record`s inmutables** — value objects sin identidad propia,
  embebidos en `Paciente.Antecedentes` y `AgentExecutionLog.ToolCalls` respectivamente.
- Fuera de este modelo (documentado como pendiente en [07-roadmap-futuro.md](07-roadmap-futuro.md)):
  `Contrarreferencia` como entidad completa, `Conversation`/`Memory` persistente entre sesiones de agente
  (cada ejecucion de agente en esta PoC es efimera, acotada al caso), `Tool Call` como coleccion propia
  (aqui se embebe dentro de `AgentExecutionLog`).
