using System.Text.Json.Nodes;
using MediSync.Application.Abstractions;
using MediSync.Domain.Auditoria;

namespace MediSync.AI.Tools;

public class RecordDecisionLogTool(IDecisionLogRepository decisionLogs) : IAgentTool
{
    public string Name => "record_decision_log";
    public string Description => "Registra en el log de auditoria la decision y justificacion tomada por un agente para un caso.";

    public JsonObject InputSchema => new()
    {
        ["type"] = "object",
        ["properties"] = new JsonObject
        {
            ["listaEsperaItemId"] = new JsonObject { ["type"] = "string" },
            ["decision"] = new JsonObject { ["type"] = "string" },
            ["justificacion"] = new JsonObject { ["type"] = "string" }
        },
        ["required"] = new JsonArray("listaEsperaItemId", "decision", "justificacion")
    };

    public async Task<string> ExecuteAsync(JsonObject input, CancellationToken ct = default)
    {
        var itemId = input["listaEsperaItemId"]?.GetValue<string>() ?? throw new ArgumentException("Falta 'listaEsperaItemId'.");
        var decision = input["decision"]?.GetValue<string>() ?? throw new ArgumentException("Falta 'decision'.");
        var justificacion = input["justificacion"]?.GetValue<string>() ?? throw new ArgumentException("Falta 'justificacion'.");

        await decisionLogs.AddAsync(new DecisionLog(itemId, decision, justificacion, OrigenDecision.IA, "PriorityAgent"), ct);
        return new JsonObject { ["ok"] = true }.ToJsonString();
    }
}
