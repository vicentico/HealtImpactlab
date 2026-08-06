using System.Text.Json.Nodes;
using MediSync.Application.Abstractions;

namespace MediSync.AI.Tools;

public class GetPatientClinicalDataTool(IPacienteRepository pacientes) : IAgentTool
{
    public string Name => "get_patient_clinical_data";
    public string Description => "Obtiene edad, antecedentes clinicos (HbA1c, glicemia en ayunas, VFG, microalbuminuria/RAC, " +
        "neuropatia previa, comorbilidades, urgencias en los ultimos 90 dias) y factores de vulnerabilidad " +
        "(dependencia severa, ruralidad, determinantes sociales) del paciente dado su pacienteId.";

    public JsonObject InputSchema => new()
    {
        ["type"] = "object",
        ["properties"] = new JsonObject
        {
            ["pacienteId"] = new JsonObject { ["type"] = "string", ["description"] = "Id del paciente" }
        },
        ["required"] = new JsonArray("pacienteId")
    };

    public async Task<string> ExecuteAsync(JsonObject input, CancellationToken ct = default)
    {
        var pacienteId = input["pacienteId"]?.GetValue<string>()
            ?? throw new ArgumentException("Falta 'pacienteId'.");
        var paciente = await pacientes.GetByIdAsync(pacienteId, ct);
        if (paciente is null)
        {
            return new JsonObject { ["error"] = $"Paciente {pacienteId} no encontrado." }.ToJsonString();
        }

        var ultimo = paciente.UltimoAntecedente();
        var result = new JsonObject
        {
            ["pacienteId"] = paciente.Id,
            ["edad"] = paciente.EdadEnAnios(),
            ["hbA1c"] = ultimo?.HbA1c,
            ["glicemiaAyunas"] = ultimo?.GlicemiaAyunas,
            ["vfg"] = ultimo?.Vfg,
            ["microalbuminuriaRac"] = ultimo?.MicroalbuminuriaRac,
            ["neuropatiaPrevia"] = ultimo?.NeuropatiaPrevia ?? false,
            ["urgenciasUltimos90Dias"] = ultimo?.UrgenciasUltimos90Dias ?? 0,
            ["comorbilidades"] = ultimo is null ? new JsonArray() : new JsonArray(ultimo.Comorbilidades.Select(c => (JsonNode)c).ToArray()),
            ["dependenciaSevera"] = paciente.DependenciaSevera,
            ["ruralidad"] = paciente.Ruralidad,
            ["determinantesSociales"] = new JsonArray(paciente.DeterminantesSociales.Select(d => (JsonNode)d).ToArray())
        };
        return result.ToJsonString();
    }
}
