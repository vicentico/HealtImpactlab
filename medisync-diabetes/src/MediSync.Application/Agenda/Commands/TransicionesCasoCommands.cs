using MediatR;
using MediSync.Application.Abstractions;
using MediSync.Domain.Auditoria;
using MediSync.Domain.ListaEspera;

namespace MediSync.Application.Agenda.Commands;

public record ConfirmarAgendaCommand(string ListaEsperaItemId) : IRequest;
public record RegistrarAtencionCommand(string ListaEsperaItemId) : IRequest;
public record CerrarCasoCommand(string ListaEsperaItemId) : IRequest;

public class ConfirmarAgendaCommandHandler(IListaEsperaRepository repo, ICasoEventoRepository eventos)
    : IRequestHandler<ConfirmarAgendaCommand>
{
    public async Task Handle(ConfirmarAgendaCommand request, CancellationToken cancellationToken)
    {
        var item = await repo.GetByIdAsync(request.ListaEsperaItemId, cancellationToken)
            ?? throw new InvalidOperationException($"Caso {request.ListaEsperaItemId} no existe.");
        var transicion = item.TransicionarA(EstadoCaso.Confirmado);
        if (!transicion.IsSuccess) throw new InvalidOperationException(transicion.Error);
        await repo.UpdateAsync(item, cancellationToken);
        await eventos.AddAsync(new CasoEvento(item.Id, "Confirmado", "Cita confirmada por el paciente/canal simulado."), cancellationToken);
    }
}

public class RegistrarAtencionCommandHandler(IListaEsperaRepository repo, ICasoEventoRepository eventos)
    : IRequestHandler<RegistrarAtencionCommand>
{
    public async Task Handle(RegistrarAtencionCommand request, CancellationToken cancellationToken)
    {
        var item = await repo.GetByIdAsync(request.ListaEsperaItemId, cancellationToken)
            ?? throw new InvalidOperationException($"Caso {request.ListaEsperaItemId} no existe.");
        var transicion = item.TransicionarA(EstadoCaso.Atendido);
        if (!transicion.IsSuccess) throw new InvalidOperationException(transicion.Error);
        await repo.UpdateAsync(item, cancellationToken);
        await eventos.AddAsync(new CasoEvento(item.Id, "Atendido", "Atención clínica registrada."), cancellationToken);
    }
}

public class CerrarCasoCommandHandler(IListaEsperaRepository repo, ICasoEventoRepository eventos)
    : IRequestHandler<CerrarCasoCommand>
{
    public async Task Handle(CerrarCasoCommand request, CancellationToken cancellationToken)
    {
        var item = await repo.GetByIdAsync(request.ListaEsperaItemId, cancellationToken)
            ?? throw new InvalidOperationException($"Caso {request.ListaEsperaItemId} no existe.");
        var transicion = item.TransicionarA(EstadoCaso.Cerrado);
        if (!transicion.IsSuccess) throw new InvalidOperationException(transicion.Error);
        await repo.UpdateAsync(item, cancellationToken);
        await eventos.AddAsync(new CasoEvento(item.Id, "Cerrado", "Caso cerrado."), cancellationToken);
    }
}
