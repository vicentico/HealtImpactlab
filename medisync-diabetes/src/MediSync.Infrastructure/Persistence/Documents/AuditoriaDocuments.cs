using MediSync.Domain.Auditoria;
using MongoDB.Bson.Serialization.Attributes;

namespace MediSync.Infrastructure.Persistence.Documents;

public class CasoEventoDocument
{
    [BsonId]
    public string Id { get; set; } = string.Empty;
    public string ListaEsperaItemId { get; set; } = string.Empty;
    public string TipoEvento { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}

public class ToolCallRecordDocument
{
    public string ToolName { get; set; } = string.Empty;
    public string InputJson { get; set; } = string.Empty;
    public string OutputJson { get; set; } = string.Empty;
}

public class AgentExecutionLogDocument
{
    [BsonId]
    public string Id { get; set; } = string.Empty;
    public string ListaEsperaItemId { get; set; } = string.Empty;
    public string AgenteNombre { get; set; } = string.Empty;
    public string Input { get; set; } = string.Empty;
    public string Output { get; set; } = string.Empty;
    public List<ToolCallRecordDocument> ToolCalls { get; set; } = [];
    public int Iteraciones { get; set; }
    public int TokensEntrada { get; set; }
    public int TokensSalida { get; set; }
    public string CorrelationId { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}

public class DecisionLogDocument
{
    [BsonId]
    public string Id { get; set; } = string.Empty;
    public string ListaEsperaItemId { get; set; } = string.Empty;
    public string Decision { get; set; } = string.Empty;
    public string Justificacion { get; set; } = string.Empty;
    public OrigenDecision Origen { get; set; }
    public string Autor { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}

public static class AuditoriaMapping
{
    public static CasoEventoDocument ToDocument(this CasoEvento e) => new()
    {
        Id = e.Id,
        ListaEsperaItemId = e.ListaEsperaItemId,
        TipoEvento = e.TipoEvento,
        Descripcion = e.Descripcion,
        Timestamp = e.Timestamp
    };

    public static CasoEvento ToDomain(this CasoEventoDocument d) =>
        new(d.Id, d.ListaEsperaItemId, d.TipoEvento, d.Descripcion, d.Timestamp);

    public static AgentExecutionLogDocument ToDocument(this AgentExecutionLog l) => new()
    {
        Id = l.Id,
        ListaEsperaItemId = l.ListaEsperaItemId,
        AgenteNombre = l.AgenteNombre,
        Input = l.Input,
        Output = l.Output,
        ToolCalls = l.ToolCalls.Select(t => new ToolCallRecordDocument { ToolName = t.ToolName, InputJson = t.InputJson, OutputJson = t.OutputJson }).ToList(),
        Iteraciones = l.Iteraciones,
        TokensEntrada = l.TokensEntrada,
        TokensSalida = l.TokensSalida,
        CorrelationId = l.CorrelationId,
        Timestamp = l.Timestamp
    };

    public static AgentExecutionLog ToDomain(this AgentExecutionLogDocument d) => new(
        d.Id, d.ListaEsperaItemId, d.AgenteNombre, d.Input, d.Output,
        d.ToolCalls.Select(t => new ToolCallRecord(t.ToolName, t.InputJson, t.OutputJson)).ToList(),
        d.Iteraciones, d.TokensEntrada, d.TokensSalida, d.CorrelationId, d.Timestamp);

    public static DecisionLogDocument ToDocument(this DecisionLog l) => new()
    {
        Id = l.Id,
        ListaEsperaItemId = l.ListaEsperaItemId,
        Decision = l.Decision,
        Justificacion = l.Justificacion,
        Origen = l.Origen,
        Autor = l.Autor,
        Timestamp = l.Timestamp
    };

    public static DecisionLog ToDomain(this DecisionLogDocument d) =>
        new(d.Id, d.ListaEsperaItemId, d.Decision, d.Justificacion, d.Origen, d.Autor, d.Timestamp);
}
