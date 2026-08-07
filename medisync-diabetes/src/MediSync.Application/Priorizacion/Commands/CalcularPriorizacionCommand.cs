using MediatR;
using MediSync.Application.Abstractions;
using MediSync.Domain.Auditoria;
using MediSync.Domain.ListaEspera;
using PriorizacionEntity = MediSync.Domain.Priorizacion.Priorizacion;

namespace MediSync.Application.Priorizacion.Commands;

/// <summary>
/// Orquesta Risk Agent -> Priority Agent -> Minsal Priority Agent para un caso recién clasificado.
/// Se dispara de forma desacoplada desde CasoClasificadoNotification (simulación de event bus).
/// </summary>
public record CalcularPriorizacionCommand(string ListaEsperaItemId) : IRequest;

public class CalcularPriorizacionCommandHandler(
    IListaEsperaRepository listaEsperaRepo,
    IPriorizacionRepository priorizacionRepo,
    ICasoEventoRepository eventoRepo,
    IAgentExecutionLogRepository agentLogRepo,
    IRiskAgent riskAgent,
    IPriorityAgent priorityAgent,
    IMinsalPriorityAgent minsalPriorityAgent) : IRequestHandler<CalcularPriorizacionCommand>
{
    public async Task Handle(CalcularPriorizacionCommand request, CancellationToken cancellationToken)
    {
        var item = await listaEsperaRepo.GetByIdAsync(request.ListaEsperaItemId, cancellationToken)
            ?? throw new InvalidOperationException($"Caso {request.ListaEsperaItemId} no existe.");

        // Idempotente: si ya existe una Priorizacion para este caso (por ejemplo, un intento anterior
        // que fallo a mitad de camino y se esta reprocesando via ReprocesarPendientesCommand), se
        // reutiliza y actualiza en vez de insertar un duplicado.
        var priorizacion = await priorizacionRepo.GetByListaEsperaItemIdAsync(item.Id, cancellationToken);
        if (priorizacion is null)
        {
            priorizacion = new PriorizacionEntity(item.Id);
            await priorizacionRepo.AddAsync(priorizacion, cancellationToken);
        }

        var risk = await riskAgent.EvaluarAsync(item.PacienteId, item.Id, cancellationToken);
        priorizacion.RegistrarRiesgo(risk.RiskScore, risk.RiskLevel, risk.Justificacion, "RiskAgent");
        await priorizacionRepo.UpdateAsync(priorizacion, cancellationToken);
        await agentLogRepo.AddAsync(BuildLog(item.Id, "RiskAgent", risk.Run), cancellationToken);

        if (risk.DerivacionUrgente)
        {
            // El caso no sigue el flujo automatico de priorizacion: requiere que un profesional tome la posta
            // de inmediato (ver docs/08-analisis-ecicep-prompt.md, 3.4). Queda en Clasificado, marcado con este evento.
            await eventoRepo.AddAsync(new CasoEvento(
                item.Id,
                "DerivacionUrgente",
                risk.MotivoDerivacionUrgente ?? "Alerta clinica detectada: requiere derivacion inmediata a un profesional."), cancellationToken);
            return;
        }

        var priority = await priorityAgent.CalcularAsync(item.Id, cancellationToken);
        priorizacion.RegistrarPrioridad(priority.PriorityScore, priority.PriorityTier, priority.Justificacion, "PriorityAgent");
        await priorizacionRepo.UpdateAsync(priorizacion, cancellationToken);
        await agentLogRepo.AddAsync(BuildLog(item.Id, "PriorityAgent", priority.Run), cancellationToken);

        // Protocolo Algoritmico MINSAL (C1-C5) — segundo calculo de prioridad, paralelo al ECICEP, no
        // se mezcla con RiskScore/PriorityTier (ver docs/11-protocolo-minsal-prompt.md).
        var minsal = await minsalPriorityAgent.CalcularAsync(item.PacienteId, item.Id, cancellationToken);
        priorizacion.RegistrarMinsal(minsal.PuntajeTotal, minsal.PrioridadMinsal, minsal.EstratoRiesgo, minsal.Justificacion);
        await priorizacionRepo.UpdateAsync(priorizacion, cancellationToken);
        await agentLogRepo.AddAsync(BuildLog(item.Id, "MinsalPriorityAgent", minsal.Run), cancellationToken);

        var transicion = item.TransicionarA(EstadoCaso.Priorizado);
        if (!transicion.IsSuccess)
        {
            throw new InvalidOperationException(transicion.Error);
        }
        await listaEsperaRepo.UpdateAsync(item, cancellationToken);

        await eventoRepo.AddAsync(new CasoEvento(
            item.Id,
            "Priorizado",
            $"Riesgo={risk.RiskLevel} (score {risk.RiskScore}). Prioridad sugerida={priority.PriorityTier} (score {priority.PriorityScore}). " +
            $"Protocolo MINSAL: {minsal.PrioridadMinsal} (puntaje {minsal.PuntajeTotal}, estrato {minsal.EstratoRiesgo})."), cancellationToken);
    }

    private static AgentExecutionLog BuildLog(string listaEsperaItemId, string agente, AgentRunResult run) =>
        new(listaEsperaItemId, agente, $"Evaluar caso {listaEsperaItemId}", run.RespuestaTexto, run.ToolCalls, run.Iteraciones, run.TokensEntrada, run.TokensSalida, Guid.NewGuid().ToString("N"));
}
