using System.Text.Json.Nodes;

namespace MediSync.AI;

/// <summary>
/// Los manifiestos piden al modelo responder con un único objeto JSON al final del razonamiento.
/// Este helper tolera que el modelo lo envuelva en fences de markdown u agregue texto residual.
/// </summary>
public static class JsonResponseParser
{
    public static JsonObject ExtractJsonObject(string text)
    {
        var start = text.IndexOf('{');
        var end = text.LastIndexOf('}');
        if (start < 0 || end < start)
        {
            throw new InvalidOperationException($"La respuesta del agente no contiene un objeto JSON: {text}");
        }

        var candidate = text[start..(end + 1)];
        return JsonNode.Parse(candidate)?.AsObject()
            ?? throw new InvalidOperationException($"No se pudo parsear el JSON de la respuesta del agente: {candidate}");
    }
}
