using MediSync.Domain.Auditoria;
using MediSync.Domain.Priorizacion;
using MongoDB.Bson.Serialization.Attributes;
using PriorizacionEntity = MediSync.Domain.Priorizacion.Priorizacion;

namespace MediSync.Infrastructure.Persistence.Documents;

public class PriorizacionDocument
{
    [BsonId]
    public string Id { get; set; } = string.Empty;
    public string ListaEsperaItemId { get; set; } = string.Empty;
    public int RiskScore { get; set; }
    public RiskLevel RiskLevel { get; set; }
    public string RiskJustificacion { get; set; } = string.Empty;
    public int PriorityScore { get; set; }
    public PriorityTier PriorityTier { get; set; }
    public string PriorityJustificacion { get; set; } = string.Empty;
    public string AgenteQueEjecuto { get; set; } = string.Empty;
    public DateTime FechaCalculo { get; set; }
    public PriorityTier? TierConfirmado { get; set; }
    public string? ConfirmadaPor { get; set; }
    public OrigenDecision? OrigenConfirmacion { get; set; }
    public DateTime? FechaConfirmacion { get; set; }

    public int? PuntajeMinsal { get; set; }
    public PrioridadMinsal? PrioridadMinsal { get; set; }
    public EstratoRiesgo? EstratoRiesgo { get; set; }
    public string? MinsalJustificacion { get; set; }
}

public static class PriorizacionMapping
{
    public static PriorizacionDocument ToDocument(this PriorizacionEntity p) => new()
    {
        Id = p.Id,
        ListaEsperaItemId = p.ListaEsperaItemId,
        RiskScore = p.RiskScore,
        RiskLevel = p.RiskLevel,
        RiskJustificacion = p.RiskJustificacion,
        PriorityScore = p.PriorityScore,
        PriorityTier = p.PriorityTier,
        PriorityJustificacion = p.PriorityJustificacion,
        AgenteQueEjecuto = p.AgenteQueEjecuto,
        FechaCalculo = p.FechaCalculo,
        TierConfirmado = p.TierConfirmado,
        ConfirmadaPor = p.ConfirmadaPor,
        OrigenConfirmacion = p.OrigenConfirmacion,
        FechaConfirmacion = p.FechaConfirmacion,
        PuntajeMinsal = p.PuntajeMinsal,
        PrioridadMinsal = p.PrioridadMinsal,
        EstratoRiesgo = p.EstratoRiesgo,
        MinsalJustificacion = p.MinsalJustificacion
    };

    public static PriorizacionEntity ToDomain(this PriorizacionDocument d) => new(
        d.Id, d.ListaEsperaItemId,
        d.RiskScore, d.RiskLevel, d.RiskJustificacion,
        d.PriorityScore, d.PriorityTier, d.PriorityJustificacion,
        d.AgenteQueEjecuto, d.FechaCalculo,
        d.TierConfirmado, d.ConfirmadaPor, d.OrigenConfirmacion, d.FechaConfirmacion,
        d.PuntajeMinsal, d.PrioridadMinsal, d.EstratoRiesgo, d.MinsalJustificacion);
}
