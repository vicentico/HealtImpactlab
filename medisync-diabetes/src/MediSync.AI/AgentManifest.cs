using System.Text.Json;
using System.Text.Json.Serialization;

namespace MediSync.AI;

/// <summary>
/// Equivalente en C# al `agent.toml` de RustyHand (ver rustyhand/agents/hello-world/agent.toml):
/// nombre, modelo, system prompt y qué tools tiene permitido usar. Se serializa en JSON en vez de TOML
/// por simplicidad dentro del ecosistema .NET, pero conserva los mismos campos conceptuales.
/// </summary>
public class AgentManifest
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("model")]
    public string? Model { get; set; }

    [JsonPropertyName("max_tokens")]
    public int MaxTokens { get; set; } = 1024;

    [JsonPropertyName("temperature")]
    public double Temperature { get; set; } = 0.3;

    [JsonPropertyName("system_prompt")]
    public string SystemPrompt { get; set; } = string.Empty;

    [JsonPropertyName("tools")]
    public List<string> Tools { get; set; } = [];

    private static readonly JsonSerializerOptions SerializerOptions = new() { PropertyNameCaseInsensitive = true };

    public static AgentManifest LoadFromFile(string path)
    {
        var json = File.ReadAllText(path);
        return JsonSerializer.Deserialize<AgentManifest>(json, SerializerOptions)
            ?? throw new InvalidOperationException($"No se pudo leer el manifiesto de agente: {path}");
    }
}
