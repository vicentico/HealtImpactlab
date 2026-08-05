using MediSync.Domain.Common;

namespace MediSync.Domain.Agenda;

public class AgendaSlot : Entity
{
    public string ProfesionalId { get; private set; } = string.Empty;
    public string CentroSaludId { get; private set; } = string.Empty;
    public string EspecialidadId { get; private set; } = string.Empty;
    public DateTime FechaHora { get; private set; }
    public bool Disponible { get; private set; } = true;
    public string? ListaEsperaItemId { get; private set; }

    private AgendaSlot() { }

    public AgendaSlot(string profesionalId, string centroSaludId, string especialidadId, DateTime fechaHora)
    {
        ProfesionalId = profesionalId;
        CentroSaludId = centroSaludId;
        EspecialidadId = especialidadId;
        FechaHora = fechaHora;
        Disponible = true;
    }

    /// <summary>Rehidratación desde persistencia (uso exclusivo de MediSync.Infrastructure).</summary>
    internal AgendaSlot(string id, string profesionalId, string centroSaludId, string especialidadId, DateTime fechaHora, bool disponible, string? listaEsperaItemId)
    {
        Id = id;
        ProfesionalId = profesionalId;
        CentroSaludId = centroSaludId;
        EspecialidadId = especialidadId;
        FechaHora = fechaHora;
        Disponible = disponible;
        ListaEsperaItemId = listaEsperaItemId;
    }

    public bool Reservar(string listaEsperaItemId)
    {
        if (!Disponible) return false;
        Disponible = false;
        ListaEsperaItemId = listaEsperaItemId;
        return true;
    }
}
