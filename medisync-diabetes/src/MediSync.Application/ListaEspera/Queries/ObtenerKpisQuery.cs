using MediatR;
using MediSync.Application.Abstractions;
using MediSync.Domain.ListaEspera;

namespace MediSync.Application.ListaEspera.Queries;

/// <summary>
/// KPIs agregados sobre datos ya persistidos (lista_espera_items, caso_eventos) — ver
/// docs/08-analisis-ecicep-prompt.md, tarea 3.5. No inventa metricas de impacto clinico real (esas requieren
/// la simulacion Monte Carlo del roadmap "Requiere diseño nuevo"); solo mide lo que la PoC efectivamente registra.
/// </summary>
public record KpisDto(
    int TotalCasosActivos,
    int TotalCasosCerrados,
    int CasosDerivacionUrgente,
    double DiasEnEsperaPromedio,
    int DiasEnEsperaMaximo,
    IReadOnlyDictionary<string, int> DistribucionPorEstado,
    IReadOnlyDictionary<string, int> DistribucionPorPriorityTier,
    int NotificacionesEnviadas,
    int NotificacionesSinRespuesta,
    double TasaNsp);

public record ObtenerKpisQuery : IRequest<KpisDto>;

public class ObtenerKpisQueryHandler(
    IListaEsperaRepository listaEsperaRepo,
    IPriorizacionRepository priorizacionRepo,
    ICasoEventoRepository eventoRepo) : IRequestHandler<ObtenerKpisQuery, KpisDto>
{
    // Mismo criterio que ListarListaEsperaQuery/ObtenerCasoQuery: el tier solo es real una vez que el
    // caso avanzó a "Priorizado" o más allá.
    private static readonly HashSet<EstadoCaso> EstadosConPriorizacionCompleta =
    [
        EstadoCaso.Priorizado, EstadoCaso.EnRevision, EstadoCaso.Agendado,
        EstadoCaso.Confirmado, EstadoCaso.Atendido, EstadoCaso.Cerrado
    ];

    public async Task<KpisDto> Handle(ObtenerKpisQuery request, CancellationToken cancellationToken)
    {
        var items = await listaEsperaRepo.GetAllAsync(cancellationToken);
        var eventos = await eventoRepo.GetAllAsync(cancellationToken);

        var activos = items.Where(i => i.Estado != EstadoCaso.Cerrado).ToList();
        var cerrados = items.Count - activos.Count;

        var distribucionEstado = items
            .GroupBy(i => i.Estado.ToString())
            .ToDictionary(g => g.Key, g => g.Count());

        var tiers = new Dictionary<string, int> { ["P1"] = 0, ["P2"] = 0, ["P3"] = 0 };
        foreach (var item in items.Where(i => EstadosConPriorizacionCompleta.Contains(i.Estado)))
        {
            var priorizacion = await priorizacionRepo.GetByListaEsperaItemIdAsync(item.Id, cancellationToken);
            if (priorizacion is null) continue;
            var tier = priorizacion.PriorityTier.ToString();
            tiers[tier] = tiers.GetValueOrDefault(tier) + 1;
        }

        var casosDerivacionUrgente = eventos.Count(e => e.TipoEvento == "DerivacionUrgente");
        var notificaciones = eventos.Where(e => e.TipoEvento == "Notificacion").ToList();
        var sinRespuesta = notificaciones.Count(e => e.Descripcion.Contains("SinRespuesta"));

        var diasEnEspera = activos.Select(i => i.DiasEnEspera()).ToList();

        return new KpisDto(
            activos.Count,
            cerrados,
            casosDerivacionUrgente,
            diasEnEspera.Count > 0 ? diasEnEspera.Average() : 0,
            diasEnEspera.Count > 0 ? diasEnEspera.Max() : 0,
            distribucionEstado,
            tiers,
            notificaciones.Count,
            sinRespuesta,
            notificaciones.Count > 0 ? (double)sinRespuesta / notificaciones.Count : 0);
    }
}
