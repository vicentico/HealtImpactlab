using MediSync.Domain.Common;

namespace MediSync.Domain.Auditoria;

public class AgentExecutionLog : Entity
{
    public string ListaEsperaItemId { get; private set; } = string.Empty;
    public string AgenteNombre { get; private set; } = string.Empty;
    public string Input { get; private set; } = string.Empty;
    public string Output { get; private set; } = string.Empty;
    public List<ToolCallRecord> ToolCalls { get; private set; } = [];
    public int Iteraciones { get; private set; }
    public int TokensEntrada { get; private set; }
    public int TokensSalida { get; private set; }
    public string CorrelationId { get; private set; } = string.Empty;
    public DateTime Timestamp { get; private set; }

    private AgentExecutionLog() { }

    public AgentExecutionLog(
        string listaEsperaItemId,
        string agenteNombre,
        string input,
        string output,
        List<ToolCallRecord> toolCalls,
        int iteraciones,
        int tokensEntrada,
        int tokensSalida,
        string correlationId)
    {
        ListaEsperaItemId = listaEsperaItemId;
        AgenteNombre = agenteNombre;
        Input = input;
        Output = output;
        ToolCalls = toolCalls;
        Iteraciones = iteraciones;
        TokensEntrada = tokensEntrada;
        TokensSalida = tokensSalida;
        CorrelationId = correlationId;
        Timestamp = DateTime.UtcNow;
    }

    /// <summary>Rehidratación desde persistencia (uso exclusivo de MediSync.Infrastructure).</summary>
    internal AgentExecutionLog(
        string id, string listaEsperaItemId, string agenteNombre, string input, string output,
        List<ToolCallRecord> toolCalls, int iteraciones, int tokensEntrada, int tokensSalida,
        string correlationId, DateTime timestamp)
    {
        Id = id;
        ListaEsperaItemId = listaEsperaItemId;
        AgenteNombre = agenteNombre;
        Input = input;
        Output = output;
        ToolCalls = toolCalls;
        Iteraciones = iteraciones;
        TokensEntrada = tokensEntrada;
        TokensSalida = tokensSalida;
        CorrelationId = correlationId;
        Timestamp = timestamp;
    }
}
