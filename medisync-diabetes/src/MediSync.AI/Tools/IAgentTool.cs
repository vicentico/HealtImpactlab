using System.Text.Json.Nodes;

namespace MediSync.AI.Tools;

/// <summary>
/// Equivalente conceptual a una "tool" de RustyHand (ver builtin_tool_definitions() en tool_runner.rs),
/// pero acotado al dominio clínico de MediSync.
/// </summary>
public interface IAgentTool
{
    string Name { get; }
    string Description { get; }

    /// <summary>JSON Schema (formato Anthropic tools API) de los parámetros de entrada.</summary>
    JsonObject InputSchema { get; }

    Task<string> ExecuteAsync(JsonObject input, CancellationToken ct = default);
}
