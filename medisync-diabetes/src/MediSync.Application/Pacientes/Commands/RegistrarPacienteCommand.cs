using FluentValidation;
using MediatR;
using MediSync.Application.Abstractions;
using MediSync.Domain.Pacientes;

namespace MediSync.Application.Pacientes.Commands;

public record RegistrarPacienteCommand(
    string Run, string Nombre, DateTime FechaNacimiento, string CesfamOrigenId,
    bool DependenciaSevera = false, bool Ruralidad = false, List<string>? DeterminantesSociales = null)
    : IRequest<string>;

public class RegistrarPacienteCommandValidator : AbstractValidator<RegistrarPacienteCommand>
{
    public RegistrarPacienteCommandValidator()
    {
        RuleFor(x => x.Run).NotEmpty();
        RuleFor(x => x.Nombre).NotEmpty();
        RuleFor(x => x.CesfamOrigenId).NotEmpty();
        RuleFor(x => x.FechaNacimiento).LessThan(DateTime.UtcNow);
    }
}

public class RegistrarPacienteCommandHandler(IPacienteRepository repository) : IRequestHandler<RegistrarPacienteCommand, string>
{
    public async Task<string> Handle(RegistrarPacienteCommand request, CancellationToken cancellationToken)
    {
        var paciente = new Paciente(
            request.Run, request.Nombre, request.FechaNacimiento, request.CesfamOrigenId,
            request.DependenciaSevera, request.Ruralidad, request.DeterminantesSociales);
        await repository.AddAsync(paciente, cancellationToken);
        return paciente.Id;
    }
}
