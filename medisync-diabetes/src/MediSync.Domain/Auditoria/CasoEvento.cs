using MediSync.Domain.Common;

namespace MediSync.Domain.Auditoria;

public class CasoEvento : Entity
{
    public string ListaEsperaItemId { get; private set; } = string.Empty;
    public string TipoEvento { get; private set; } = string.Empty;
    public string Descripcion { get; private set; } = string.Empty;
    public DateTime Timestamp { get; private set; }

    private CasoEvento() { }

    public CasoEvento(string listaEsperaItemId, string tipoEvento, string descripcion)
    {
        ListaEsperaItemId = listaEsperaItemId;
        TipoEvento = tipoEvento;
        Descripcion = descripcion;
        Timestamp = DateTime.UtcNow;
    }

    /// <summary>Rehidratación desde persistencia (uso exclusivo de MediSync.Infrastructure).</summary>
    internal CasoEvento(string id, string listaEsperaItemId, string tipoEvento, string descripcion, DateTime timestamp)
    {
        Id = id;
        ListaEsperaItemId = listaEsperaItemId;
        TipoEvento = tipoEvento;
        Descripcion = descripcion;
        Timestamp = timestamp;
    }
}
