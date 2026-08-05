using MediatR;
using MediSync.Application.Abstractions;
using MediSync.Domain.ListaEspera;

namespace MediSync.Application.ListaEspera.Queries;

public record ListaEsperaItemDto(
    string ListaEsperaItemId,
    string PacienteId,
    string PacienteNombre,
    string EspecialidadId,
    string Estado,
    int DiasEnEspera,
    string? PriorityTier,
    int? PriorityScore);

public record ListarListaEsperaQuery : IRequest<IReadOnlyList<ListaEsperaItemDto>>;

public class ListarListaEsperaQueryHandler(
    IListaEsperaRepository listaEsperaRepo,
    IPacienteRepository pacienteRepo,
    IPriorizacionRepository priorizacionRepo) : IRequestHandler<ListarListaEsperaQuery, IReadOnlyList<ListaEsperaItemDto>>
{
    // La priorización solo se considera completa (y por tanto mostrable) una vez que el caso
    // avanzó más allá de "Clasificado": evita mostrar PriorityTier.P1 (valor 0 del enum) como si
    // fuera una prioridad real cuando el pipeline de agentes IA quedó a medio camino (p.ej. fallo de Anthropic).
    private static readonly HashSet<EstadoCaso> EstadosConPriorizacionCompleta =
    [
        EstadoCaso.Priorizado, EstadoCaso.EnRevision, EstadoCaso.Agendado,
        EstadoCaso.Confirmado, EstadoCaso.Atendido, EstadoCaso.Cerrado
    ];

    public async Task<IReadOnlyList<ListaEsperaItemDto>> Handle(ListarListaEsperaQuery request, CancellationToken cancellationToken)
    {
        var items = await listaEsperaRepo.GetAllAsync(cancellationToken);
        var result = new List<ListaEsperaItemDto>(items.Count);

        foreach (var item in items)
        {
            var paciente = await pacienteRepo.GetByIdAsync(item.PacienteId, cancellationToken);
            var priorizacionCompleta = EstadosConPriorizacionCompleta.Contains(item.Estado)
                ? await priorizacionRepo.GetByListaEsperaItemIdAsync(item.Id, cancellationToken)
                : null;
            result.Add(new ListaEsperaItemDto(
                item.Id,
                item.PacienteId,
                paciente?.Nombre ?? "(desconocido)",
                item.EspecialidadId,
                item.Estado.ToString(),
                item.DiasEnEspera(),
                priorizacionCompleta?.PriorityTier.ToString(),
                priorizacionCompleta?.PriorityScore));
        }

        return result
            .OrderByDescending(r => r.PriorityTier is "P1")
            .ThenByDescending(r => r.PriorityTier is "P2")
            .ThenByDescending(r => r.DiasEnEspera)
            .ToList();
    }
}
