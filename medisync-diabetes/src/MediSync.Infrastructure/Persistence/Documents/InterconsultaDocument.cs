using MediSync.Domain.Interconsultas;
using MongoDB.Bson.Serialization.Attributes;

namespace MediSync.Infrastructure.Persistence.Documents;

public class InterconsultaDocument
{
    [BsonId]
    public string Id { get; set; } = string.Empty;
    public string PacienteId { get; set; } = string.Empty;
    public string EspecialidadId { get; set; } = string.Empty;
    public string CesfamOrigenId { get; set; } = string.Empty;
    public DateTime FechaDerivacion { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public EstadoInterconsulta Estado { get; set; }
}

public static class InterconsultaMapping
{
    public static InterconsultaDocument ToDocument(this Interconsulta i) => new()
    {
        Id = i.Id,
        PacienteId = i.PacienteId,
        EspecialidadId = i.EspecialidadId,
        CesfamOrigenId = i.CesfamOrigenId,
        FechaDerivacion = i.FechaDerivacion,
        Motivo = i.Motivo,
        Estado = i.Estado
    };

    public static Interconsulta ToDomain(this InterconsultaDocument d) => new(
        d.Id, d.PacienteId, d.EspecialidadId, d.CesfamOrigenId, d.Motivo, d.FechaDerivacion, d.Estado);
}
