using MediSync.Domain.Common;

namespace MediSync.Domain.Auditoria;

public class DecisionLog : Entity
{
    public string ListaEsperaItemId { get; private set; } = string.Empty;
    public string Decision { get; private set; } = string.Empty;
    public string Justificacion { get; private set; } = string.Empty;
    public OrigenDecision Origen { get; private set; }
    public string Autor { get; private set; } = string.Empty;
    public DateTime Timestamp { get; private set; }

    private DecisionLog() { }

    public DecisionLog(string listaEsperaItemId, string decision, string justificacion, OrigenDecision origen, string autor)
    {
        ListaEsperaItemId = listaEsperaItemId;
        Decision = decision;
        Justificacion = justificacion;
        Origen = origen;
        Autor = autor;
        Timestamp = DateTime.UtcNow;
    }

    /// <summary>Rehidratación desde persistencia (uso exclusivo de MediSync.Infrastructure).</summary>
    internal DecisionLog(string id, string listaEsperaItemId, string decision, string justificacion, OrigenDecision origen, string autor, DateTime timestamp)
    {
        Id = id;
        ListaEsperaItemId = listaEsperaItemId;
        Decision = decision;
        Justificacion = justificacion;
        Origen = origen;
        Autor = autor;
        Timestamp = timestamp;
    }
}
