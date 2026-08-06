using System.Text.Json.Nodes;
using MediSync.Application.Abstractions;
using MediSync.Domain.Auditoria;

namespace MediSync.AI.Tools;

/// <summary>
/// Simula el envio de una notificacion omnicanal (WhatsApp/SMS/Telefono) y la respuesta del paciente, y la
/// deja registrada como CasoEvento — proxy del 15,6% de inasistencia (NSP) que cita el dossier ECICEP
/// (ver docs/08-analisis-ecicep-prompt.md, 3.6). No llama a ningun servicio externo real.
/// </summary>
public class NotifyDummyChannelTool(ICasoEventoRepository eventos) : IAgentTool
{
    private const double ProbabilidadSinRespuesta = 0.156;
    private const double ProbabilidadRechazado = 0.05;

    public string Name => "notify_dummy_channel";
    public string Description =>
        "Simula el envio de una notificacion omnicanal (WhatsApp/SMS/Telefono) al paciente informando su cita " +
        "asignada, y simula su respuesta (Confirmado/Rechazado/SinRespuesta), dejandola registrada en el caso.";

    public JsonObject InputSchema => new()
    {
        ["type"] = "object",
        ["properties"] = new JsonObject
        {
            ["listaEsperaItemId"] = new JsonObject { ["type"] = "string" },
            ["mensaje"] = new JsonObject { ["type"] = "string" },
            ["canal"] = new JsonObject
            {
                ["type"] = "string",
                ["enum"] = new JsonArray("WhatsApp", "SMS", "Telefono"),
                ["description"] = "Canal omnicanal a usar. Si no se especifica, se usa WhatsApp (canal institucional por defecto)."
            }
        },
        ["required"] = new JsonArray("listaEsperaItemId", "mensaje")
    };

    public async Task<string> ExecuteAsync(JsonObject input, CancellationToken ct = default)
    {
        var itemId = input["listaEsperaItemId"]?.GetValue<string>() ?? throw new ArgumentException("Falta 'listaEsperaItemId'.");
        var mensaje = input["mensaje"]?.GetValue<string>() ?? string.Empty;
        var canal = input["canal"]?.GetValue<string>() ?? "WhatsApp";

        var respuesta = SimularRespuesta();
        await eventos.AddAsync(new CasoEvento(
            itemId, "Notificacion", $"Canal={canal}. Mensaje: \"{mensaje}\". Respuesta simulada del paciente: {respuesta}."), ct);

        return new JsonObject
        {
            ["canal"] = canal,
            ["enviado"] = true,
            ["mensaje"] = mensaje,
            ["respuesta"] = respuesta
        }.ToJsonString();
    }

    private static string SimularRespuesta()
    {
        var roll = Random.Shared.NextDouble();
        if (roll < ProbabilidadSinRespuesta) return "SinRespuesta";
        if (roll < ProbabilidadSinRespuesta + ProbabilidadRechazado) return "Rechazado";
        return "Confirmado";
    }
}
