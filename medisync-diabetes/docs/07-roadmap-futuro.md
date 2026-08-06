# 07. Roadmap futuro

Lo que queda pendiente del prompt maestro completo (`../claude.md`), agrupado por que tan lejos esta de la
base actual. Esta PoC fue diseñada para que estos items se agreguen sin reescribir el dominio ni el
orquestador (ver [02-arquitectura.md](02-arquitectura.md), seccion "puerto/adaptador para IA").

## Cerca de la base actual (extender, no reescribir)

Actualizado a partir del dossier de postulacion Impact Lab 2026 (`Proyecto_Priorizacion_Inteligente_ECICEP_ImpactLab.pdf`,
ver [docs/](.)); el detalle de implementacion de cada item con clases y archivos concretos esta en
[08-analisis-ecicep-prompt.md](08-analisis-ecicep-prompt.md).

- **Score de Criticidad Real ECICEP ponderado (W1-W4)**: hoy el Risk/Priority Agent razona libre con Claude;
  el dossier define una formula oficial (`Severidad 40% + Urgencia_Reciente 25% + Latencia_Ponderada 20% +
  Vulnerabilidad 15%`). Se ajusta el `system_prompt` de `risk-agent.json` para que el desglose por factor sea
  explicito y auditable — no requiere cambiar `AgentLoop` ni el contrato del agente.
- **Campos clinicos y sociodemograficos nuevos**: `AntecedenteClinico` necesita VFG, microalbuminuria/RAC y
  neuropatia previa (Severidad) y conteo de urgencias SAPU/SAR/UEH en 90 dias (Urgencia_Reciente); `Paciente`
  necesita dependencia severa, ruralidad y determinantes sociales (Vulnerabilidad). Son campos nuevos sobre
  entidades existentes, sin cambiar el modelo de agregados.
- **Derivacion urgente automatica** (sospecha IAM/ACV, crisis hiperglicemica con compromiso de conciencia, pie
  diabetico infectado activo, caida de VFG >30%): nuevo tool (`CheckEmergencyEscalationTool`) que el Risk Agent
  invoca antes del scoring normal; reusa el patron de tools + `CasoEvento` ya existente.
- **Reingreso de paciente y contrarreferencia formal**: se agregan como nuevos `Command`s en
  `MediSync.Application` sobre las entidades existentes (`Interconsulta`, `ListaEsperaItem`); no requieren
  nuevo modelo.
- **Mas agentes especializados** (Referral Agent, Notification Agent, Audit Agent con razonamiento propio,
  Supervisor Agent): se agregan como nuevas clases en `MediSync.AI/Agents/` + manifiesto JSON, reusando
  `AgentLoop` tal cual. El punto de extension ya existe.
- **Canal omnicanal y NSP (inasistencia)**: extender `NotifyDummyChannelTool` para registrar canal
  (WhatsApp/SMS/Telefono) y respuesta simulada (Confirmado/Rechazado/SinRespuesta) en `CasoEvento`, como proxy
  del 15,6% de inasistencia que cita el dossier. Sigue siendo simulado (sin integracion real de WhatsApp
  Business API).
- **KPIs y dashboards** alineados a las metas del dossier (latencia de casos de alto riesgo, casos derivados de
  urgencia, distribucion de `PriorityTier`, tiempo hasta clasificacion/derivacion, tiempo ahorrado): son queries
  de agregacion sobre las colecciones ya existentes (`lista_espera_items`, `caso_eventos`) — no requieren nuevas
  fuentes de datos, solo nuevos `Query` + endpoints + una pantalla Angular adicional.
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
