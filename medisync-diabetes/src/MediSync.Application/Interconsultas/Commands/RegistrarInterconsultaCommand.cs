using FluentValidation;
using MediatR;
using MediSync.Application.Abstractions;
using MediSync.Application.ListaEspera.Events;
using MediSync.Domain.Auditoria;
using MediSync.Domain.Interconsultas;
using MediSync.Domain.ListaEspera;
using MediSync.Domain.Pacientes;

namespace MediSync.Application.Interconsultas.Commands;

public record RegistrarInterconsultaCommand(
    string PacienteId,
    string EspecialidadId,
    string Motivo,
    double HbA1c,
    double GlicemiaAyunas,
    List<string>? Comorbilidades) : IRequest<string>;

public class RegistrarInterconsultaCommandValidator : AbstractValidator<RegistrarInterconsultaCommand>
{
    public RegistrarInterconsultaCommandValidator()
    {
        RuleFor(x => x.PacienteId).NotEmpty();
        RuleFor(x => x.EspecialidadId).NotEmpty();
        RuleFor(x => x.Motivo).NotEmpty();
        RuleFor(x => x.HbA1c).GreaterThan(0);
        RuleFor(x => x.GlicemiaAyunas).GreaterThan(0);
    }
}

public class RegistrarInterconsultaCommandHandler(
    IPacienteRepository pacientes,
    IInterconsultaRepository interconsultas,
    IListaEsperaRepository listaEspera,
    ICasoEventoRepository eventos,
    IPublisher publisher) : IRequestHandler<RegistrarInterconsultaCommand, string>
{
    public async Task<string> Handle(RegistrarInterconsultaCommand request, CancellationToken cancellationToken)
    {
        var paciente = await pacientes.GetByIdAsync(request.PacienteId, cancellationToken)
            ?? throw new InvalidOperationException($"Paciente {request.PacienteId} no existe.");

        paciente.RegistrarAntecedente(new AntecedenteClinico(
            request.HbA1c,
            request.GlicemiaAyunas,
            request.Comorbilidades ?? [],
            DateTime.UtcNow));
        await pacientes.UpdateAsync(paciente, cancellationToken);

        var interconsulta = new Interconsulta(request.PacienteId, request.EspecialidadId, paciente.CesfamOrigenId, request.Motivo);
        interconsulta.MarcarDerivada();
        await interconsultas.AddAsync(interconsulta, cancellationToken);

        var item = new ListaEsperaItem(interconsulta.Id, request.PacienteId, request.EspecialidadId);
        await listaEspera.AddAsync(item, cancellationToken);
        await eventos.AddAsync(new CasoEvento(item.Id, "IngresoListaEspera", $"Paciente {paciente.Nombre} ingresa a lista de espera de {request.EspecialidadId}."), cancellationToken);

        var transicion = item.TransicionarA(EstadoCaso.Clasificado);
        if (!transicion.IsSuccess)
        {
            throw new InvalidOperationException(transicion.Error);
        }
        await listaEspera.UpdateAsync(item, cancellationToken);
        await eventos.AddAsync(new CasoEvento(item.Id, "Clasificado", "Caso clasificado en lista de espera de la especialidad."), cancellationToken);

        await publisher.Publish(new CasoClasificadoNotification(item.Id), cancellationToken);

        return item.Id;
    }
}
