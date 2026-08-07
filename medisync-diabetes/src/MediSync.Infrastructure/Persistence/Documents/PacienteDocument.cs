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
    public bool DependenciaSevera { get; set; }
    public bool Ruralidad { get; set; }
    public List<string> DeterminantesSociales { get; set; } = [];
    public NivelRedApoyo? NivelRedApoyo { get; set; }
    public List<AtencionUrgenciaDocument> AtencionesUrgencia { get; set; } = [];
    public List<HospitalizacionDocument> Hospitalizaciones { get; set; } = [];
}

public class AntecedenteClinicoDocument
{
    public double HbA1c { get; set; }
    public double GlicemiaAyunas { get; set; }
    public List<string> Comorbilidades { get; set; } = [];
    public DateTime FechaRegistro { get; set; }
    public double? Vfg { get; set; }
    public double? MicroalbuminuriaRac { get; set; }
    public bool NeuropatiaPrevia { get; set; }
    public int UrgenciasUltimos90Dias { get; set; }
    public List<string> AlertasClinicas { get; set; } = [];
    public int NumeroFarmacosActivos { get; set; }
}

public class AtencionUrgenciaDocument
{
    public DateTime Fecha { get; set; }
    public string Motivo { get; set; } = string.Empty;
}

public class HospitalizacionDocument
{
    public DateTime FechaIngreso { get; set; }
    public DateTime? FechaAlta { get; set; }
    public string Motivo { get; set; } = string.Empty;
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
        DependenciaSevera = p.DependenciaSevera,
        Ruralidad = p.Ruralidad,
        DeterminantesSociales = p.DeterminantesSociales.ToList(),
        NivelRedApoyo = p.NivelRedApoyo,
        Antecedentes = p.Antecedentes.Select(a => new AntecedenteClinicoDocument
        {
            HbA1c = a.HbA1c,
            GlicemiaAyunas = a.GlicemiaAyunas,
            Comorbilidades = a.Comorbilidades.ToList(),
            FechaRegistro = a.FechaRegistro,
            Vfg = a.Vfg,
            MicroalbuminuriaRac = a.MicroalbuminuriaRac,
            NeuropatiaPrevia = a.NeuropatiaPrevia,
            UrgenciasUltimos90Dias = a.UrgenciasUltimos90Dias,
            AlertasClinicas = a.AlertasClinicas.ToList(),
            NumeroFarmacosActivos = a.NumeroFarmacosActivos
        }).ToList(),
        AtencionesUrgencia = p.AtencionesUrgencia.Select(a => new AtencionUrgenciaDocument
        {
            Fecha = a.Fecha,
            Motivo = a.Motivo
        }).ToList(),
        Hospitalizaciones = p.Hospitalizaciones.Select(h => new HospitalizacionDocument
        {
            FechaIngreso = h.FechaIngreso,
            FechaAlta = h.FechaAlta,
            Motivo = h.Motivo
        }).ToList()
    };

    public static Paciente ToDomain(this PacienteDocument d) => new(
        d.Id, d.Run, d.Nombre, d.FechaNacimiento, d.CesfamOrigenId,
        d.Antecedentes.Select(a => new AntecedenteClinico(
            a.HbA1c, a.GlicemiaAyunas, a.Comorbilidades, a.FechaRegistro,
            a.Vfg, a.MicroalbuminuriaRac, a.NeuropatiaPrevia, a.UrgenciasUltimos90Dias, a.AlertasClinicas,
            a.NumeroFarmacosActivos)).ToList(),
        d.DependenciaSevera, d.Ruralidad, d.DeterminantesSociales, d.NivelRedApoyo,
        d.AtencionesUrgencia.Select(a => new AtencionUrgencia(a.Fecha, a.Motivo)).ToList(),
        d.Hospitalizaciones.Select(h => new Hospitalizacion(h.FechaIngreso, h.FechaAlta, h.Motivo)).ToList());
}
