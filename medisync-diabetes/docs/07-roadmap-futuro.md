# 07. Roadmap futuro

Lo que queda pendiente del prompt maestro completo (`../claude.md`), agrupado por que tan lejos esta de la
base actual. Esta PoC fue diseñada para que estos items se agreguen sin reescribir el dominio ni el
orquestador (ver [02-arquitectura.md](02-arquitectura.md), seccion "puerto/adaptador para IA").

## Cerca de la base actual (extender, no reescribir)

Actualizado a partir del dossier de postulacion Impact Lab 2026 (`Proyecto_Priorizacion_Inteligente_ECICEP_ImpactLab.pdf`,
ver [docs/](.)); el detalle de implementacion de cada item con clases y archivos concretos esta en
[08-analisis-ecicep-prompt.md](08-analisis-ecicep-prompt.md). Los primeros 5 items ya estan implementados y
verificados end-to-end contra la API de Anthropic real (backend); falta unicamente la pantalla Angular de KPIs.

- ✅ **Score de Criticidad Real ECICEP ponderado (W1-W4) — implementado**: `risk-agent.json` calcula
  `Severidad (0.40) + Urgencia_Reciente (0.25) + Vulnerabilidad (0.15)` con desglose explicito por factor en la
  justificacion; `Latencia_Ponderada (0.20)` la sigue aplicando el Priority Agent con el tiempo de espera.
- ✅ **Campos clinicos y sociodemograficos nuevos — implementado**: `AntecedenteClinico` tiene `Vfg`,
  `MicroalbuminuriaRac`, `NeuropatiaPrevia`, `UrgenciasUltimos90Dias`, `AlertasClinicas`; `Paciente` tiene
  `DependenciaSevera`, `Ruralidad`, `DeterminantesSociales`. Propagados por `RegistrarInterconsultaCommand`/
  `RegistrarPacienteCommand`, Mongo (`PacienteDocument`) y `GetPatientClinicalDataTool`.
- ✅ **Derivacion urgente automatica — implementado**: `CheckEmergencyEscalationTool` (deterministico, no
  delega en Claude) detecta `AlertasClinicas` explicitas o caida de VFG >30% entre las 2 ultimas mediciones;
  el Risk Agent lo invoca primero y, si hay alarma, el caso queda en `Clasificado` con un `CasoEvento`
  `DerivacionUrgente` en vez de seguir al Priority Agent. Visible tambien en `GET /api/lista-espera`
  (`requiereDerivacionUrgente`, ordenado primero).
- **Reingreso de paciente y contrarreferencia formal**: se agregan como nuevos `Command`s en
  `MediSync.Application` sobre las entidades existentes (`Interconsulta`, `ListaEsperaItem`); no requieren
  nuevo modelo.
- **Mas agentes especializados** (Referral Agent, Notification Agent, Audit Agent con razonamiento propio,
  Supervisor Agent): se agregan como nuevas clases en `MediSync.AI/Agents/` + manifiesto JSON, reusando
  `AgentLoop` tal cual. El punto de extension ya existe.
- ✅ **Canal omnicanal y NSP (inasistencia) — implementado**: `NotifyDummyChannelTool` registra el canal
  (WhatsApp por defecto/SMS/Telefono) y simula la respuesta del paciente (`Confirmado`/`Rechazado`/
  `SinRespuesta`, con 15,6% de probabilidad de `SinRespuesta` como proxy del NSP del dossier) en un
  `CasoEvento` `Notificacion`. Sigue siendo simulado (sin integracion real de WhatsApp Business API).
- ✅ **KPIs (backend) — implementado, falta el frontend**: `GET /api/kpis` agrega sobre `lista_espera_items` y
  `caso_eventos` (casos activos/cerrados, casos con derivacion urgente, dias de espera promedio/maximo,
  distribucion por estado y por `PriorityTier`, notificaciones enviadas/sin respuesta, tasa de NSP). Falta la
  pantalla Angular que consuma este endpoint.
- **Angular Material completo / mas pantallas**: el frontend actual ya usa Standalone Components + Signals;
  agregar Material o mas vistas es incremental sobre `frontend/medisync-web`.
- **500 pacientes / 2000 interconsultas de dummy data**: el seeder (`DummyDataSeeder`) ya lee de
  `dummy-data/*.json` — escalar el volumen es generar mas filas en esos JSON, no cambiar codigo.

## Requieren diseño nuevo (no triviales)

- **MCP real (seudonimizacion local antes de razonar con Claude)**: el dossier ECICEP exige que ningun dato
  identificable (RUT, nombre) salga de la red segura del servicio de salud. Hoy `MediSync.AI` llama directo a
  la Anthropic Messages API con un `HttpClient` propio (ver [rustyhand-analisis.md](rustyhand-analisis.md)),
  sin capa de seudonimizacion. Requiere un componente nuevo entre `AgentLoop` y el cliente HTTP que sustituya
  identificadores por tokens antes de enviar el prompt, y los revierta en la respuesta.
- **Simulacion Monte Carlo / DES sobre cohorte sintetica (50.000-150.000 pacientes)**: el dossier propone 5
  escenarios de validacion (FIFO control, ECICEP puro, Integrado, Estres de red, Ruido de datos) antes de un
  despliegue real. La PoC actual usa 24 pacientes dummy fijos, no un motor de simulacion de eventos discretos;
  esto es un modulo nuevo, independiente del dominio actual (ver [08-analisis-ecicep-prompt.md](08-analisis-ecicep-prompt.md)).
- **Event Bus real (Kafka / Azure Service Bus / RabbitMQ)**: hoy `CasoClasificadoNotification` (MediatR
  `INotification`) simula el bus dentro del mismo proceso. Migrar a un bus real implica: (a) publicar el
  evento serializado en vez de invocar un handler in-process, (b) un consumer/worker separado que ejecute
  `CalcularPriorizacionCommand`, (c) manejo de reintentos/DLQ que hoy no existen. El contrato del evento
  (`CasoClasificadoNotification`) ya esta definido, lo que facilita la migracion.
- **HL7 FHIR / SNOMED / LOINC reales**: hoy `AntecedenteClinico` usa campos simples (`HbA1c: double`,
  `GlicemiaAyunas: double`). Adoptar FHIR implicaria introducir `Observation` con `code` (LOINC) y `value`,
  y `Condition` con codificacion SNOMED para comorbilidades — un cambio de modelo de dominio, no solo de
  persistencia. Se recomienda hacerlo como una capa de mapeo (`FhirObservationMapper`) que traduzca desde/hacia
  el modelo interno, para no acoplar todo el dominio a FHIR desde el dia uno.
- **RBAC y autenticacion**: ningun endpoint esta protegido hoy. Requiere decidir el proveedor de identidad
  (Azure AD / Auth0 / IdentityServer) y donde vive el rol "medico" vs "administrativo CESFAM" — esto es
  una decision de producto ademas de tecnica.
- **Multiagente con Coordinator/Supervisor real**: si el flujo dejara de ser lineal (por ejemplo, saltar
  revision medica automatica para P3 de bajo riesgo, o permitir que un agente pida ayuda a otro), el orden
  determinista actual en `Application` no alcanza y se necesitaria un Coordinator Agent con su propio prompt
  decidiendo el siguiente paso — el patron de A2A (agent-to-agent) de RustyHand es la referencia natural.

## Documentacion de nivel empresa pendiente (del prompt maestro completo)

- Diagramas C4 de 4 niveles (aqui solo se cubrieron Nivel 1 y 2, ver
  [02-arquitectura.md](02-arquitectura.md)).
- Diagramas UML adicionales mas alla del modelo de dominio (ver [03-modelo-dominio.md](03-modelo-dominio.md)).
- Mapa completo de agentes y mapa de eventos a nivel de toda la plataforma.
- Backlog completo con historias de usuario y criterios de aceptacion.
- Roadmap de implementacion organizado en sprints.
- Riesgos tecnicos y clinicos documentados formalmente.
- Metricas de exito con linea base y objetivo (hoy se registran los datos crudos — `AgentExecutionLog`,
  `CasoEvento` — pero no hay un dashboard de KPIs agregados).

Estos entregables son principalmente de **documentacion/planificacion**, no de codigo: no bloquean evolucionar
la PoC tecnicamente, pero son necesarios antes de presentar el proyecto como candidato a piloto real en un
CESFAM u hospital.
