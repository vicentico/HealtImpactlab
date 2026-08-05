using FluentValidation;
using MediatR;
using MediSync.Application.Abstractions;
using MediSync.Domain.Auditoria;
using MediSync.Domain.ListaEspera;
using MediSync.Domain.Priorizacion;

namespace MediSync.Application.ListaEspera.Commands;

/// <summary>
/// Revisión médica: un profesional aprueba o ajusta la prioridad sugerida por la IA.
/// Al confirmar, dispara al Scheduler Agent para asignar cupo de agenda.
/// </summary>
public record RevisarCasoCommand(string ListaEsperaItemId, string AprobadoPor, PriorityTier PrioridadConfirmada) : IRequest;

public class RevisarCasoCommandValidator : AbstractValidator<RevisarCasoCommand>
{
    public RevisarCasoCommandValidator()
    {
        RuleFor(x => x.ListaEsperaItemId).NotEmpty();
        RuleFor(x => x.AprobadoPor).NotEmpty();
    }
}

public class RevisarCasoCommandHandler(
    IListaEsperaRepository listaEsperaRepo,
    IPriorizacionRepository priorizacionRepo,
    IDecisionLogRepository decisionLogRepo,
    ICasoEventoRepository eventoRepo,
    IAgentExecutionLogRepository agentLogRepo,
    ISchedulerAgent schedulerAgent) : IRequestHandler<RevisarCasoCommand>
{
    public async Task Handle(RevisarCasoCommand request, CancellationToken cancellationToken)
    {
        var item = await listaEsperaRepo.GetByIdAsync(request.ListaEsperaItemId, cancellationToken)
            ?? throw new InvalidOperationException($"Caso {request.ListaEsperaItemId} no existe.");
        var priorizacion = await priorizacionRepo.GetByListaEsperaItemIdAsync(item.Id, cancellationToken)
            ?? throw new InvalidOperationException($"El caso {item.Id} aún no tiene priorización IA calculada.");

        var origenAntesDeConfirmar = request.PrioridadConfirmada == priorizacion.PriorityTier ? OrigenDecision.IA : OrigenDecision.Humano;
        priorizacion.ConfirmarRevisionMedica(request.PrioridadConfirmada, request.AprobadoPor);
        await priorizacionRepo.UpdateAsync(priorizacion, cancellationToken);

        var transicionRevision = item.TransicionarA(EstadoCaso.EnRevision);
        if (!transicionRevision.IsSuccess) throw new InvalidOperationException(transicionRevision.Error);
        await listaEsperaRepo.UpdateAsync(item, cancellationToken);

        await decisionLogRepo.AddAsync(new DecisionLog(
            item.Id,
            $"Prioridad confirmada: {request.PrioridadConfirmada}",
            origenAntesDeConfirmar == OrigenDecision.IA
                ? "El médico confirmó la prioridad sugerida por la IA sin cambios."
                : $"El médico ajustó la prioridad sugerida por la IA ({priorizacion.PriorityTier}) a {request.PrioridadConfirmada}.",
            origenAntesDeConfirmar,
            request.AprobadoPor), cancellationToken);
        await eventoRepo.AddAsync(new CasoEvento(item.Id, "RevisionMedica", $"Revisado por {request.AprobadoPor}. Prioridad final: {request.PrioridadConfirmada}."), cancellationToken);

        var scheduler = await schedulerAgent.AsignarAsync(item.Id, cancellationToken);
        await agentLogRepo.AddAsync(new AgentExecutionLog(
            item.Id, "SchedulerAgent", $"Asignar agenda para caso {item.Id}", scheduler.Run.RespuestaTexto,
            scheduler.Run.ToolCalls, scheduler.Run.Iteraciones, scheduler.Run.TokensEntrada, scheduler.Run.TokensSalida,
            Guid.NewGuid().ToString("N")), cancellationToken);

        var transicionAgendado = item.TransicionarA(EstadoCaso.Agendado);
        if (!transicionAgendado.IsSuccess) throw new InvalidOperationException(transicionAgendado.Error);
        await listaEsperaRepo.UpdateAsync(item, cancellationToken);

        await eventoRepo.AddAsync(new CasoEvento(item.Id, "Agendado", $"Cupo asignado: {scheduler.FechaHora:yyyy-MM-dd HH:mm} con profesional {scheduler.ProfesionalId}. {scheduler.Justificacion}"), cancellationToken);
    }
}
