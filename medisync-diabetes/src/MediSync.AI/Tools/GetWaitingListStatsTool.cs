using System.Text.Json.Nodes;
using MediSync.Application.Abstractions;

namespace MediSync.AI.Tools;

public class GetWaitingListStatsTool(IListaEsperaRepository listaEspera) : IAgentTool
{
    public string Name => "get_waiting_list_stats";
    public string Description => "Obtiene cuantos pacientes estan actualmente en espera para una especialidad dada.";

    public JsonObject InputSchema => new()
    {
        ["type"] = "object",
        ["properties"] = new JsonObject
        {
            ["especialidadId"] = new JsonObject { ["type"] = "string", ["description"] = "Id de la especialidad" }
        },
        ["required"] = new JsonArray("especialidadId")
    };

    public async Task<string> ExecuteAsync(JsonObject input, CancellationToken ct = default)
    {
        var especialidadId = input["especialidadId"]?.GetValue<string>()
            ?? throw new ArgumentException("Falta 'especialidadId'.");
        var count = await listaEspera.CountEnEsperaPorEspecialidadAsync(especialidadId, ct);
        return new JsonObject
        {
            ["especialidadId"] = especialidadId,
            ["pacientesEnEspera"] = count
        }.ToJsonString();
    }
}
