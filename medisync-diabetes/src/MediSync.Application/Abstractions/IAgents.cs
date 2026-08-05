using MediSync.Domain.Auditoria;
using MediSync.Domain.Priorizacion;

namespace MediSync.Application.Abstractions;

/// <summary>Resultado crudo de una ejecución de agente (mapea 1:1 a un AgentExecutionLog).</summary>
public record AgentRunResult(
    string RespuestaTexto,
    List<ToolCallRecord> ToolCalls,
    int Iteraciones,
    int TokensEntrada,
    int TokensSalida);

public record RiskAssessment(int RiskScore, RiskLevel RiskLevel, string Justificacion, AgentRunResult Run);

public record PriorityAssessment(int PriorityScore, PriorityTier PriorityTier, string Justificacion, AgentRunResult Run);

public record SchedulerAssignment(string AgendaSlotId, DateTime FechaHora, string ProfesionalId, string CentroSaludId, string Justificacion, AgentRunResult Run);

public interface IRiskAgent
{
    Task<RiskAssessment> EvaluarAsync(string pacienteId, string listaEsperaItemId, CancellationToken ct = default);
}

public interface IPriorityAgent
{
    Task<PriorityAssessment> CalcularAsync(string listaEsperaItemId, CancellationToken ct = default);
}

public interface ISchedulerAgent
{
    Task<SchedulerAssignment> AsignarAsync(string listaEsperaItemId, CancellationToken ct = default);
}
