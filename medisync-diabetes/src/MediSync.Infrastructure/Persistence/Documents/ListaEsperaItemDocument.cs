using MediSync.Domain.ListaEspera;
using MongoDB.Bson.Serialization.Attributes;

namespace MediSync.Infrastructure.Persistence.Documents;

public class ListaEsperaItemDocument
{
    [BsonId]
    public string Id { get; set; } = string.Empty;
    public string InterconsultaId { get; set; } = string.Empty;
    public string PacienteId { get; set; } = string.Empty;
    public string EspecialidadId { get; set; } = string.Empty;
    public EstadoCaso Estado { get; set; }
    public DateTime FechaIngreso { get; set; }
}

public static class ListaEsperaItemMapping
{
    public static ListaEsperaItemDocument ToDocument(this ListaEsperaItem x) => new()
    {
        Id = x.Id,
        InterconsultaId = x.InterconsultaId,
        PacienteId = x.PacienteId,
        EspecialidadId = x.EspecialidadId,
        Estado = x.Estado,
        FechaIngreso = x.FechaIngreso
    };

    public static ListaEsperaItem ToDomain(this ListaEsperaItemDocument d) => new(
        d.Id, d.InterconsultaId, d.PacienteId, d.EspecialidadId, d.Estado, d.FechaIngreso);
}
