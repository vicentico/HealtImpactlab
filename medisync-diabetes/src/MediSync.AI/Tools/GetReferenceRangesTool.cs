using System.Text.Json.Nodes;

namespace MediSync.AI.Tools;

/// <summary>Rangos clínicos de referencia (dummy) para HbA1c y glicemia en ayunas en pacientes diabéticos.</summary>
public class GetReferenceRangesTool : IAgentTool
{
    public string Name => "get_reference_ranges";
    public string Description => "Obtiene rangos clinicos de referencia para HbA1c (%) y glicemia en ayunas (mg/dL) en pacientes diabeticos.";

    public JsonObject InputSchema => new()
    {
        ["type"] = "object",
        ["properties"] = new JsonObject(),
        ["required"] = new JsonArray()
    };

    public Task<string> ExecuteAsync(JsonObject input, CancellationToken ct = default)
    {
        var result = new JsonObject
        {
            ["hbA1c_porcentaje"] = new JsonObject
            {
                ["normal"] = "< 5.7",
                ["prediabetes"] = "5.7 - 6.4",
                ["diabetes_controlada"] = "6.5 - 7.5",
                ["diabetes_no_controlada"] = "> 7.5"
            },
            ["glicemia_ayunas_mg_dl"] = new JsonObject
            {
                ["normal"] = "70 - 99",
                ["prediabetes"] = "100 - 125",
                ["diabetes"] = ">= 126"
            }
        };
        return Task.FromResult(result.ToJsonString());
    }
}
