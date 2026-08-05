using MediSync.Domain.Catalogos;
using MongoDB.Bson.Serialization.Attributes;

namespace MediSync.Infrastructure.Persistence.Documents;

public class EspecialidadDocument
{
    [BsonId]
    public string Id { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
}

public class CentroSaludDocument
{
    [BsonId]
    public string Id { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public TipoCentroSalud Tipo { get; set; }
}

public class ProfesionalDocument
{
    [BsonId]
    public string Id { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string EspecialidadId { get; set; } = string.Empty;
    public string CentroSaludId { get; set; } = string.Empty;
}

public static class CatalogoMapping
{
    public static EspecialidadDocument ToDocument(this Especialidad e) => new() { Id = e.Id, Nombre = e.Nombre };
    public static Especialidad ToDomain(this EspecialidadDocument d) => new(d.Id, d.Nombre);

    public static CentroSaludDocument ToDocument(this CentroSalud c) => new() { Id = c.Id, Nombre = c.Nombre, Tipo = c.Tipo };
    public static CentroSalud ToDomain(this CentroSaludDocument d) => new(d.Id, d.Nombre, d.Tipo);

    public static ProfesionalDocument ToDocument(this Profesional p) => new() { Id = p.Id, Nombre = p.Nombre, EspecialidadId = p.EspecialidadId, CentroSaludId = p.CentroSaludId };
    public static Profesional ToDomain(this ProfesionalDocument d) => new(d.Id, d.Nombre, d.EspecialidadId, d.CentroSaludId);
}
