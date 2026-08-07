using MediatR;
using MediSync.Application.Abstractions;
using MediSync.Domain.ListaEspera;

namespace MediSync.Application.ListaEspera.Queries;

/// <summary>
/// Cruza dos señales de priorizacion independientes — Estrato de Riesgo G1-G3 (Protocolo MINSAL) x
/// PriorityTier P1-P3 (modelo ECICEP) — para detectar divergencias entre ambos modelos (ver
/// docs/11-protocolo-minsal-prompt.md, 4.6). Celdas[estrato][tier] = cantidad de casos activos.
/// </summary>
public record MatrizRiesgoDto(Dictionary<string, Dictionary<string, int>> Celdas);

public record ObtenerMatrizRiesgoQuery : IRequest<MatrizRiesgoDto>;

public class ObtenerMatrizRiesgoQueryHandler(
    IListaEsperaRepository listaEsperaRepo,
    IPriorizacionRepository priorizacionRepo) : IRequestHandler<ObtenerMatrizRiesgoQuery, MatrizRiesgoDto>
{
    private static readonly string[] Estratos = ["G1", "G2", "G3"];
    private static readonly string[] Tiers = ["P1", "P2", "P3"];

    public async Task<MatrizRiesgoDto> Handle(ObtenerMatrizRiesgoQuery request, CancellationToken cancellationToken)
    {
        var celdas = Estratos.ToDictionary(e => e, e => Tiers.ToDictionary(t => t, t => 0));

        var items = await listaEsperaRepo.GetAllAsync(cancellationToken);
        foreach (var item in items.Where(i => i.Estado != EstadoCaso.Cerrado))
        {
            var p = await priorizacionRepo.GetByListaEsperaItemIdAsync(item.Id, cancellationToken);
            // EstratoRiesgo solo se registra si el pipeline llego hasta el Minsal Priority Agent, lo que
            // implica que PriorityTier tambien es real (ver orden en CalcularPriorizacionCommand).
            if (p?.EstratoRiesgo is null) continue;

            celdas[p.EstratoRiesgo.Value.ToString()][p.PriorityTier.ToString()]++;
        }

        return new MatrizRiesgoDto(celdas);
    }
}
