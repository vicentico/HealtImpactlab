using System.Text.Json.Nodes;
using MediSync.Application.Abstractions;

namespace MediSync.AI.Tools;

public class GetAvailableSlotsTool(IAgendaSlotRepository agendaSlots) : IAgentTool
{
    public string Name => "get_available_slots";
    public string Description => "Lista los cupos de agenda disponibles (no reservados) para una especialidad, ordenados por fecha mas proxima.";

    public JsonObject InputSchema => new()
    {
        ["type"] = "object",
        ["properties"] = new JsonObject
        {
            ["especialidadId"] = new JsonObject { ["type"] = "string" }
        },
        ["required"] = new JsonArray("especialidadId")
    };

    public async Task<string> ExecuteAsync(JsonObject input, CancellationToken ct = default)
    {
        var especialidadId = input["especialidadId"]?.GetValue<string>()
            ?? throw new ArgumentException("Falta 'especialidadId'.");
        var slots = await agendaSlots.GetDisponiblesPorEspecialidadAsync(especialidadId, ct);

        var array = new JsonArray(slots
            .OrderBy(s => s.FechaHora)
            .Select(s => (JsonNode)new JsonObject
            {
                ["agendaSlotId"] = s.Id,
                ["fechaHora"] = s.FechaHora.ToString("O"),
                ["profesionalId"] = s.ProfesionalId,
                ["centroSaludId"] = s.CentroSaludId
            }).ToArray());

        return new JsonObject { ["cuposDisponibles"] = array }.ToJsonString();
    }
}
