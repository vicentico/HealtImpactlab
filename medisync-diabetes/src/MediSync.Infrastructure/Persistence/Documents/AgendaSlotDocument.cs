using MediSync.Domain.Agenda;
using MongoDB.Bson.Serialization.Attributes;

namespace MediSync.Infrastructure.Persistence.Documents;

public class AgendaSlotDocument
{
    [BsonId]
    public string Id { get; set; } = string.Empty;
    public string ProfesionalId { get; set; } = string.Empty;
    public string CentroSaludId { get; set; } = string.Empty;
    public string EspecialidadId { get; set; } = string.Empty;
    public DateTime FechaHora { get; set; }
    public bool Disponible { get; set; }
    public string? ListaEsperaItemId { get; set; }
}

public static class AgendaSlotMapping
{
    public static AgendaSlotDocument ToDocument(this AgendaSlot s) => new()
    {
        Id = s.Id,
        ProfesionalId = s.ProfesionalId,
        CentroSaludId = s.CentroSaludId,
        EspecialidadId = s.EspecialidadId,
        FechaHora = s.FechaHora,
        Disponible = s.Disponible,
        ListaEsperaItemId = s.ListaEsperaItemId
    };

    public static AgendaSlot ToDomain(this AgendaSlotDocument d) => new(
        d.Id, d.ProfesionalId, d.CentroSaludId, d.EspecialidadId, d.FechaHora, d.Disponible, d.ListaEsperaItemId);
}
