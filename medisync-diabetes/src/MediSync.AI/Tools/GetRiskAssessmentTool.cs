using System.Text.Json.Nodes;
using MediSync.Application.Abstractions;

namespace MediSync.AI.Tools;

public class GetRiskAssessmentTool(IPriorizacionRepository priorizaciones) : IAgentTool
{
    public string Name => "get_risk_assessment";
    public string Description => "Obtiene el RiskScore/RiskLevel ya calculado por el Risk Agent para un caso de lista de espera.";

    public JsonObject InputSchema => new()
    {
        ["type"] = "object",
        ["properties"] = new JsonObject
        {
            ["listaEsperaItemId"] = new JsonObject { ["type"] = "string", ["description"] = "Id del caso en lista de espera" }
        },
        ["required"] = new JsonArray("listaEsperaItemId")
    };

    public async Task<string> ExecuteAsync(JsonObject input, CancellationToken ct = default)
    {
        var itemId = input["listaEsperaItemId"]?.GetValue<string>()
            ?? throw new ArgumentException("Falta 'listaEsperaItemId'.");
        var priorizacion = await priorizaciones.GetByListaEsperaItemIdAsync(itemId, ct);
        if (priorizacion is null)
        {
            return new JsonObject { ["error"] = $"Aun no existe evaluacion de riesgo para el caso {itemId}." }.ToJsonString();
        }

        return new JsonObject
        {
            ["riskScore"] = priorizacion.RiskScore,
            ["riskLevel"] = priorizacion.RiskLevel.ToString(),
            ["justificacion"] = priorizacion.RiskJustificacion
        }.ToJsonString();
    }
}
