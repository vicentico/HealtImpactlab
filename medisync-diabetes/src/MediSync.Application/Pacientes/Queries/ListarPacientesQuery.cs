using MediatR;
using MediSync.Application.Abstractions;

namespace MediSync.Application.Pacientes.Queries;

public record PacienteResumenDto(string PacienteId, string Nombre, string Run, int Edad, string CesfamOrigenId);

public record ListarPacientesQuery(string? Texto) : IRequest<IReadOnlyList<PacienteResumenDto>>;

public class ListarPacientesQueryHandler(IPacienteRepository pacientes)
    : IRequestHandler<ListarPacientesQuery, IReadOnlyList<PacienteResumenDto>>
{
    public async Task<IReadOnlyList<PacienteResumenDto>> Handle(ListarPacientesQuery request, CancellationToken cancellationToken)
    {
        var lista = await pacientes.BuscarAsync(request.Texto, cancellationToken);
        return lista.Select(p => new PacienteResumenDto(p.Id, p.Nombre, p.Run, p.EdadEnAnios(), p.CesfamOrigenId)).ToList();
    }
}
