using MediSync.Domain.Pacientes;
using MongoDB.Bson.Serialization.Attributes;

namespace MediSync.Infrastructure.Persistence.Documents;

public class PacienteDocument
{
    [BsonId]
    public string Id { get; set; } = string.Empty;
    public string Run { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public DateTime FechaNacimiento { get; set; }
    public string CesfamOrigenId { get; set; } = string.Empty;
    public List<AntecedenteClinicoDocument> Antecedentes { get; set; } = [];
}

public class AntecedenteClinicoDocument
{
    public double HbA1c { get; set; }
    public double GlicemiaAyunas { get; set; }
    public List<string> Comorbilidades { get; set; } = [];
    public DateTime FechaRegistro { get; set; }
}

public static class PacienteMapping
{
    public static PacienteDocument ToDocument(this Paciente p) => new()
    {
        Id = p.Id,
        Run = p.Run,
        Nombre = p.Nombre,
        FechaNacimiento = p.FechaNacimiento,
        CesfamOrigenId = p.CesfamOrigenId,
        Antecedentes = p.Antecedentes.Select(a => new AntecedenteClinicoDocument
        {
            HbA1c = a.HbA1c,
            GlicemiaAyunas = a.GlicemiaAyunas,
            Comorbilidades = a.Comorbilidades.ToList(),
            FechaRegistro = a.FechaRegistro
        }).ToList()
    };

    public static Paciente ToDomain(this PacienteDocument d) => new(
        d.Id, d.Run, d.Nombre, d.FechaNacimiento, d.CesfamOrigenId,
        d.Antecedentes.Select(a => new AntecedenteClinico(a.HbA1c, a.GlicemiaAyunas, a.Comorbilidades, a.FechaRegistro)).ToList());
}
