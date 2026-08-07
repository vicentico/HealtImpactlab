using MediSync.Domain.Auditoria;
using MediSync.Domain.Common;

namespace MediSync.Domain.Priorizacion;

public class Priorizacion : Entity
{
    public string ListaEsperaItemId { get; private set; } = string.Empty;
    public int RiskScore { get; private set; }
    public RiskLevel RiskLevel { get; private set; }
    public string RiskJustificacion { get; private set; } = string.Empty;
    public int PriorityScore { get; private set; }
    public PriorityTier PriorityTier { get; private set; }
    public string PriorityJustificacion { get; private set; } = string.Empty;
    public string AgenteQueEjecuto { get; private set; } = string.Empty;
    public DateTime FechaCalculo { get; private set; }

    public PriorityTier? TierConfirmado { get; private set; }
    public string? ConfirmadaPor { get; private set; }
    public OrigenDecision? OrigenConfirmacion { get; private set; }
    public DateTime? FechaConfirmacion { get; private set; }

    /// <summary>Segundo calculo de prioridad, paralelo al ECICEP: Protocolo Algoritmico MINSAL
    /// (ver docs/11-protocolo-minsal-prompt.md). No se mezcla con RiskScore/PriorityTier.</summary>
    public int? PuntajeMinsal { get; private set; }
    public PrioridadMinsal? PrioridadMinsal { get; private set; }
    public EstratoRiesgo? EstratoRiesgo { get; private set; }
    public string? MinsalJustificacion { get; private set; }

    private Priorizacion() { }

    public Priorizacion(string listaEsperaItemId)
    {
        ListaEsperaItemId = listaEsperaItemId;
    }

    /// <summary>Rehidratación desde persistencia (uso exclusivo de MediSync.Infrastructure).</summary>
    internal Priorizacion(
        string id, string listaEsperaItemId,
        int riskScore, RiskLevel riskLevel, string riskJustificacion,
        int priorityScore, PriorityTier priorityTier, string priorityJustificacion,
        string agenteQueEjecuto, DateTime fechaCalculo,
        PriorityTier? tierConfirmado, string? confirmadaPor, OrigenDecision? origenConfirmacion, DateTime? fechaConfirmacion,
        int? puntajeMinsal, PrioridadMinsal? prioridadMinsal, EstratoRiesgo? estratoRiesgo, string? minsalJustificacion)
    {
        Id = id;
        ListaEsperaItemId = listaEsperaItemId;
        RiskScore = riskScore;
        RiskLevel = riskLevel;
        RiskJustificacion = riskJustificacion;
        PriorityScore = priorityScore;
        PriorityTier = priorityTier;
        PriorityJustificacion = priorityJustificacion;
        AgenteQueEjecuto = agenteQueEjecuto;
        FechaCalculo = fechaCalculo;
        TierConfirmado = tierConfirmado;
        ConfirmadaPor = confirmadaPor;
        OrigenConfirmacion = origenConfirmacion;
        FechaConfirmacion = fechaConfirmacion;
        PuntajeMinsal = puntajeMinsal;
        PrioridadMinsal = prioridadMinsal;
        EstratoRiesgo = estratoRiesgo;
        MinsalJustificacion = minsalJustificacion;
    }

    public void RegistrarRiesgo(int riskScore, RiskLevel riskLevel, string justificacion, string agente)
    {
        RiskScore = riskScore;
        RiskLevel = riskLevel;
        RiskJustificacion = justificacion;
        AgenteQueEjecuto = agente;
        FechaCalculo = DateTime.UtcNow;
    }

    public void RegistrarPrioridad(int priorityScore, PriorityTier priorityTier, string justificacion, string agente)
    {
        PriorityScore = priorityScore;
        PriorityTier = priorityTier;
        PriorityJustificacion = justificacion;
        AgenteQueEjecuto = agente;
        FechaCalculo = DateTime.UtcNow;
    }

    public void RegistrarMinsal(int puntajeMinsal, PrioridadMinsal prioridadMinsal, EstratoRiesgo estratoRiesgo, string justificacion)
    {
        PuntajeMinsal = puntajeMinsal;
        PrioridadMinsal = prioridadMinsal;
        EstratoRiesgo = estratoRiesgo;
        MinsalJustificacion = justificacion;
    }

    public void ConfirmarRevisionMedica(PriorityTier tierConfirmado, string aprobadoPor)
    {
        TierConfirmado = tierConfirmado;
        ConfirmadaPor = aprobadoPor;
        OrigenConfirmacion = tierConfirmado == PriorityTier ? OrigenDecision.IA : OrigenDecision.Humano;
        FechaConfirmacion = DateTime.UtcNow;
    }
}
