# Analisis de RustyHand — patrones adoptados

`../rustyhand` es un "Agent Operating System" en Rust (10 crates, ~134K LOC) usado exclusivamente como
referencia arquitectonica para esta PoC — **no se reutilizo ni tradujo codigo Rust**, solo se extrajeron
patrones y se reconstruyeron en C#/.NET 10, tal como pedia el prompt maestro (`../claude.md`).

## Que se investigo

Se leyo el `README.md` de RustyHand y dos archivos concretos:

- `rustyhand/agents/hello-world/agent.toml` — formato de manifiesto de agente.
- `rustyhand/crates/rusty-hand-runtime/src/agent_loop.rs` (referenciado en el README como el ciclo:
  recall memoria -> construir system prompt -> llamar LLM -> si `tool_use`, ejecutar tool y repetir hasta 50
  iteraciones -> extraer respuesta).

## Patrones adoptados y su traduccion a C#

| Patron RustyHand | Implementacion en MediSync |
|---|---|
| `agent.toml` (name, model, system_prompt, resources, capabilities.tools) | `MediSync.AI/AgentManifest.cs` + `Manifests/*.json` — mismos campos conceptuales, JSON en vez de TOML |
| Agent loop (recall -> prompt -> LLM -> tool_use -> repetir -> end_turn, max iteraciones) | `MediSync.AI/AgentLoop.cs` — mismo ciclo, sin la etapa de recall vectorial (cada ejecucion es acotada al caso, no hay memoria semantica entre sesiones en esta PoC) |
| `AgentLoopResult` (`.response`, `.total_usage`, `.cost_usd`) | `AgentRunResult` (`RespuestaTexto`, `ToolCalls`, `Iteraciones`, `TokensEntrada`, `TokensSalida`) en `Application.Abstractions` |
| `ToolDefinition` (name, description, JSON Schema input) para el LLM | `IAgentTool.InputSchema` (`JsonObject` con el mismo formato de JSON Schema que usa la Anthropic tools API) |
| Kernel central orquestando subsistemas | No se replico un "kernel" — la orquestacion vive distribuida en los `Command Handler`s de `MediSync.Application`, mas simple y suficiente para el flujo lineal de esta PoC (ver seccion "Coordinator/Supervisor" en [07-roadmap-futuro.md](07-roadmap-futuro.md)) |
| Event bus interno (Message, ToolResult, Lifecycle, System) | `CasoClasificadoNotification` (MediatR `INotification`) — un subconjunto minimo: solo el evento que realmente dispara trabajo desacoplado en esta PoC |
| Audit trail (Merkle hash-chain) | `CasoEvento` + `DecisionLog` + `AgentExecutionLog` — auditoria simple por timestamp, sin cadena criptografica (fuera de alcance de una PoC; ver roadmap si se requiere tamper-evidence) |
| Metering (tokens/costo por agente) | `AgentExecutionLog.TokensEntrada/TokensSalida` por ejecucion — sin enforcement de budget (RustyHand tiene `max_llm_tokens_per_hour` por agente; no se implemento limite de gasto en esta PoC) |
| A2A (Agent-to-Agent protocol) | No implementado — los 3 agentes de esta PoC no se comunican entre si directamente, solo comparten estado via MongoDB (cada uno lee lo que el anterior escribio). Se documenta como necesario si se agrega un Coordinator real (ver roadmap) |

## Que se descarto conscientemente

- **WASM sandbox para tools**: las tools de MediSync corren in-process en .NET con acceso directo a los
  repositorios — no ejecutan codigo arbitrario ni de terceros, por lo que el sandboxing de RustyHand (pensado
  para tools/skills instalables dinamicamente) no aplica.
- **Multiples proveedores de LLM y fallback automatico**: RustyHand soporta 7 proveedores con
  auto-deteccion. Esta PoC usa Anthropic exclusivamente via `AnthropicClient` — es lo que pedia el prompt
  maestro ("usar el SDK de Claude como motor principal").
- **Dashboard React con 15 paginas**: se opto por Angular 20 (pedido explicito del prompt maestro) acotado a
  3 pantallas, no por replicar el dashboard de RustyHand.

## Por que HttpClient propio y no el Claude Agent SDK oficial

RustyHand implementa su propio driver de LLM (`rusty-hand-runtime/src/drivers/anthropic.rs`) en vez de
depender de un SDK oficial externo — el mismo razonamiento aplica aqui: un `AnthropicClient` delgado +
`AgentLoop` propio en C# da control total del ciclo tool-use dentro del mismo proceso .NET, sin la
complejidad operativa de levantar un sidecar Node/Python solo para usar el SDK oficial de Claude. La
matriz de decision completa esta documentada en el plan de implementacion de este proyecto; el resumen es
que `IAgentRuntime`/`IRiskAgent`/`IPriorityAgent`/`ISchedulerAgent` (interfaces en `Application.Abstractions`)
existen precisamente para poder sustituir esta implementacion por un sidecar con el SDK oficial mas adelante,
sin tocar el dominio ni los casos de uso.
