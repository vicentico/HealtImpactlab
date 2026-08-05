using System.Text.Json.Nodes;
using MediSync.AI.Tools;
using MediSync.Application.Abstractions;
using MediSync.Domain.Auditoria;

namespace MediSync.AI;

/// <summary>
/// Port conceptual de rustyhand/crates/rusty-hand-runtime/src/agent_loop.rs a .NET:
/// construir mensaje -> llamar LLM -> si stop_reason=tool_use, ejecutar la tool y reenviar
/// tool_result -> repetir hasta stop_reason=end_turn o alcanzar el máximo de iteraciones.
/// A diferencia de RustyHand no hay recall de memoria vectorial: cada ejecución es acotada al caso.
/// </summary>
public class AgentLoop(AnthropicClient client, IReadOnlyDictionary<string, IAgentTool> allTools)
{
    public async Task<AgentRunResult> RunAsync(AgentManifest manifest, string userMessage, CancellationToken ct = default)
    {
        var tools = manifest.Tools
            .Select(name => allTools.TryGetValue(name, out var tool)
                ? tool
                : throw new InvalidOperationException($"Tool '{name}' requerida por el agente '{manifest.Name}' no está registrada."))
            .ToList();

        var messages = new JsonArray
        {
            new JsonObject { ["role"] = "user", ["content"] = userMessage }
        };

        var toolCalls = new List<ToolCallRecord>();
        var tokensEntrada = 0;
        var tokensSalida = 0;
        var iteraciones = 0;
        var maxIterations = client.MaxIterations;

        while (true)
        {
            iteraciones++;
            if (iteraciones > maxIterations)
            {
                throw new InvalidOperationException(
                    $"Agente '{manifest.Name}' superó el máximo de {maxIterations} iteraciones sin llegar a end_turn.");
            }

            var request = new JsonObject
            {
                ["model"] = manifest.Model ?? client.Model,
                ["max_tokens"] = manifest.MaxTokens,
                ["temperature"] = manifest.Temperature,
                ["system"] = manifest.SystemPrompt,
                ["messages"] = messages.DeepClone(),
                ["tools"] = new JsonArray(tools.Select(t => (JsonNode)new JsonObject
                {
                    ["name"] = t.Name,
                    ["description"] = t.Description,
                    ["input_schema"] = t.InputSchema.DeepClone()
                }).ToArray())
            };

            var response = await client.SendMessageAsync(request, ct);

            var usage = response["usage"]?.AsObject();
            tokensEntrada += usage?["input_tokens"]?.GetValue<int>() ?? 0;
            tokensSalida += usage?["output_tokens"]?.GetValue<int>() ?? 0;

            var stopReason = response["stop_reason"]?.GetValue<string>() ?? "end_turn";
            var contentBlocks = response["content"]?.AsArray() ?? [];

            var textoRespuesta = string.Join("\n", contentBlocks
                .Where(b => b?["type"]?.GetValue<string>() == "text")
                .Select(b => b!["text"]!.GetValue<string>()));

            if (stopReason != "tool_use")
            {
                return new AgentRunResult(textoRespuesta, toolCalls, iteraciones, tokensEntrada, tokensSalida);
            }

            // El bloque completo del assistant (texto + tool_use) se re-envía tal cual a la conversación.
            messages.Add(new JsonObject { ["role"] = "assistant", ["content"] = contentBlocks.DeepClone() });

            var toolResults = new JsonArray();
            foreach (var block in contentBlocks)
            {
                if (block?["type"]?.GetValue<string>() != "tool_use") continue;

                var toolUseId = block["id"]!.GetValue<string>();
                var toolName = block["name"]!.GetValue<string>();
                var toolInput = block["input"]?.AsObject() ?? [];

                var tool = allTools.TryGetValue(toolName, out var t)
                    ? t
                    : throw new InvalidOperationException($"El modelo solicitó la tool desconocida '{toolName}'.");

                var output = await tool.ExecuteAsync(toolInput, ct);
                toolCalls.Add(new ToolCallRecord(toolName, toolInput.ToJsonString(), output));

                toolResults.Add(new JsonObject
                {
                    ["type"] = "tool_result",
                    ["tool_use_id"] = toolUseId,
                    ["content"] = output
                });
            }

            messages.Add(new JsonObject { ["role"] = "user", ["content"] = toolResults });
        }
    }
}
