using System.Text.Json.Nodes;
using MediSync.Application.Abstractions;

namespace MediSync.AI.Tools;

public class ReserveSlotTool(IAgendaSlotRepository agendaSlots) : IAgentTool
{
    public string Name => "reserve_slot";
    public string Description => "Reserva un cupo de agenda especifico (agendaSlotId) para un caso de lista de espera (listaEsperaItemId).";

    public JsonObject InputSchema => new()
    {
        ["type"] = "object",
        ["properties"] = new JsonObject
        {
            ["agendaSlotId"] = new JsonObject { ["type"] = "string" },
            ["listaEsperaItemId"] = new JsonObject { ["type"] = "string" }
        },
        ["required"] = new JsonArray("agendaSlotId", "listaEsperaItemId")
    };

    public async Task<string> ExecuteAsync(JsonObject input, CancellationToken ct = default)
    {
        var slotId = input["agendaSlotId"]?.GetValue<string>() ?? throw new ArgumentException("Falta 'agendaSlotId'.");
        var itemId = input["listaEsperaItemId"]?.GetValue<string>() ?? throw new ArgumentException("Falta 'listaEsperaItemId'.");

        var slot = await agendaSlots.GetByIdAsync(slotId, ct);
        if (slot is null)
        {
            return new JsonObject { ["error"] = $"Cupo {slotId} no existe." }.ToJsonString();
        }

        if (!slot.Reservar(itemId))
        {
            return new JsonObject { ["error"] = $"Cupo {slotId} ya no esta disponible." }.ToJsonString();
        }

        await agendaSlots.UpdateAsync(slot, ct);
        return new JsonObject
        {
            ["ok"] = true,
            ["agendaSlotId"] = slot.Id,
            ["fechaHora"] = slot.FechaHora.ToString("O"),
            ["profesionalId"] = slot.ProfesionalId,
            ["centroSaludId"] = slot.CentroSaludId
        }.ToJsonString();
    }
}
