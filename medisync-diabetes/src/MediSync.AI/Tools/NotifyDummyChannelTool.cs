using System.Text.Json.Nodes;

namespace MediSync.AI.Tools;

/// <summary>Simula el envio de SMS/email de confirmacion. No llama a ningun servicio externo real.</summary>
public class NotifyDummyChannelTool : IAgentTool
{
    public string Name => "notify_dummy_channel";
    public string Description => "Simula el envio de una notificacion (SMS/email) al paciente informando su cita asignada.";

    public JsonObject InputSchema => new()
    {
        ["type"] = "object",
        ["properties"] = new JsonObject
        {
            ["listaEsperaItemId"] = new JsonObject { ["type"] = "string" },
            ["mensaje"] = new JsonObject { ["type"] = "string" }
        },
        ["required"] = new JsonArray("listaEsperaItemId", "mensaje")
    };

    public Task<string> ExecuteAsync(JsonObject input, CancellationToken ct = default)
    {
        var mensaje = input["mensaje"]?.GetValue<string>() ?? string.Empty;
        return Task.FromResult(new JsonObject
        {
            ["canal"] = "dummy-sms",
            ["enviado"] = true,
            ["mensaje"] = mensaje
        }.ToJsonString());
    }
}
