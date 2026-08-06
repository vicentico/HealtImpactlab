# 01. Vision y alcance de la PoC

## Vision completa (prompt maestro)

`../claude.md` describe MediSync-Diabetes como una plataforma nacional: 9 agentes especializados,
interoperabilidad HL7 FHIR/SNOMED/LOINC, Angular 20 con dashboards de KPIs, event sourcing, mensajeria
(Kafka/Service Bus/RabbitMQ), 500 pacientes y 2000 interconsultas de datos dummy, C4 completo (4 niveles),
backlog con historias de usuario, roadmap de sprints, y preparacion para escalar a un sistema de salud
nacional. Esa vision **no se implementa aqui**; sirve como fuente de verdad del dominio y como horizonte al
que esta PoC deberia poder evolucionar (ver [07-roadmap-futuro.md](07-roadmap-futuro.md)).

## Alcance de esta PoC

### Flujo cubierto de punta a punta

```
Paciente -> Derivacion -> Lista de espera -> Clasificacion -> Priorizacion IA
  -> Revision medica -> Agenda -> Confirmacion -> Atencion -> Cierre
```

Las 10 etapas del flujo minimo estan implementadas y son demostrables con una sola sesion de `curl` o desde
el frontend (ver [05-flujo-secuencia.md](05-flujo-secuencia.md)).

### Casos de uso dentro del alcance

- Registrar Paciente (incluye factores de vulnerabilidad: dependencia severa, ruralidad, determinantes sociales)
- Registrar Interconsulta (incluye antecedentes/examenes ECICEP: HbA1c, glicemia, VFG, microalbuminuria/RAC,
  neuropatia previa, urgencias en 90 dias, comorbilidades, alertas clinicas)
- Calcular riesgo con el Score de Criticidad Real ECICEP ponderado (Risk Agent, IA real)
- Detectar derivacion urgente automatica (chequeo deterministico, fuera del flujo normal de priorizacion)
- Actualizar prioridad (Priority Agent, IA real)
- Revision medica (aprobar o ajustar la prioridad sugerida por la IA)
- Asignar agenda y notificar por canal omnicanal simulado, con respuesta simulada (Scheduler Agent, IA real)
- Confirmar agenda / Registrar atencion / Cerrar caso
- Consultar estado / trazabilidad completa de un caso
- Consultar KPIs agregados (casos activos/cerrados, derivaciones urgentes, distribucion por prioridad, tasa de NSP)
- Auditar proceso (eventos, decisiones y ejecuciones de agentes quedan todos registrados)

### Explicitamente fuera de alcance (ver roadmap)

- Reingreso de paciente y contrarreferencia formal.
- HL7 FHIR / SNOMED / LOINC reales (solo se documenta el mapeo conceptual en el modelo de dominio).
- Event Bus real (Kafka/Azure Service Bus/RabbitMQ): se simula con una notificacion de MediatR
  (`CasoClasificadoNotification`) que dispara el pipeline de agentes de forma desacoplada dentro del mismo
  proceso.
- RBAC, autenticacion, multi-tenant.
- Los 9 agentes completos del prompt maestro: se implementaron 3 (Risk, Priority, Scheduler). Referral,
  Notification, Audit, Supervisor y Coordinator existen hoy como logica determinista en `Application`
  (transiciones de estado, `CasoEvento`, `DecisionLog`), no como agentes con su propio prompt — evita
  sobreingenieria para una PoC.
- 500 pacientes / 2000 interconsultas de dummy data: esta PoC siembra 24 pacientes, 5 profesionales, 3 CESFAM
  y 2 hospitales (`dummy-data/*.json`), suficiente para poblar la lista de espera y demostrar el flujo.
- Angular Material completo y dashboards de KPIs multi-grafico: el frontend tiene 4 pantallas funcionales
  (lista de espera, ingreso, detalle/trazabilidad, KPIs) sin libreria de componentes visuales. Hay un
  dashboard de KPIs (`GET /api/kpis` + pantalla `/kpis`) con tarjetas de estado y barras simples en CSS, pero
  no graficos interactivos ni Angular Material.
- Diagramas C4 de 4 niveles, backlog con historias de usuario, roadmap de sprints detallado: pertenecen al
  prompt maestro completo: se resumen como pendientes en [07-roadmap-futuro.md](07-roadmap-futuro.md).

## Por que este recorte

El objetivo central del prompt maestro es demostrar que **la priorizacion inteligente con IA real** puede
acelerar la descompresion de listas de espera. Ese valor se prueba con 3 agentes que razonan sobre datos
clinicos reales y dejan una justificacion auditable — no con la cantidad de pantallas, agentes o estandares
implementados. El resto de la vision (interoperabilidad, escalabilidad, gobierno de datos) es evolutivo y se
construye sobre esta base sin reescribirla, gracias a los limites de capa explicitos en
[02-arquitectura.md](02-arquitectura.md) (p.ej. `IAgentRuntime`/agentes detras de interfaces en `Application`).
