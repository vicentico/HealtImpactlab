using MediatR;
using MediSync.Application.Abstractions;
using MediSync.Domain.ListaEspera;

namespace MediSync.Application.Priorizacion.Commands;

/// <summary>
/// Reprocesa casos "no priorizados": ListaEsperaItem en Clasificado cuya Priorizacion no existe o quedo
/// incompleta (por ejemplo, porque la API de Anthropic fallo a mitad del pipeline la primera vez). No
/// duplica logica: reenvia el mismo CalcularPriorizacionCommand ya existente por cada pendiente. Ver
/// docs/11-protocolo-minsal-prompt.md, 4.7.
/// </summary>
public record ReprocesarPendientesDto(int PendientesEncontrados, int ProcesadosOk, int DerivadosUrgente, int Fallidos);

public record ReprocesarPendientesCommand : IRequest<ReprocesarPendientesDto>;

public class ReprocesarPendientesCommandHandler(
    IListaEsperaRepository listaEsperaRepo,
    IPriorizacionRepository priorizacionRepo,
    ISender sender) : IRequestHandler<ReprocesarPendientesCommand, ReprocesarPendientesDto>
{
    public async Task<ReprocesarPendientesDto> Handle(ReprocesarPendientesCommand request, CancellationToken cancellationToken)
    {
        var items = await listaEsperaRepo.GetAllAsync(cancellationToken);
        var pendientes = new List<ListaEsperaItem>();
        foreach (var item in items.Where(i => i.Estado == EstadoCaso.Clasificado))
        {
            var priorizacion = await priorizacionRepo.GetByListaEsperaItemIdAsync(item.Id, cancellationToken);
            if (priorizacion is null || string.IsNullOrEmpty(priorizacion.RiskJustificacion))
            {
                pendientes.Add(item);
            }
        }

        var procesadosOk = 0;
        var derivadosUrgente = 0;
        var fallidos = 0;

        foreach (var item in pendientes)
        {
            try
            {
                await sender.Send(new CalcularPriorizacionCommand(item.Id), cancellationToken);

                var itemActualizado = await listaEsperaRepo.GetByIdAsync(item.Id, cancellationToken);
                if (itemActualizado?.Estado == EstadoCaso.Clasificado)
                {
                    // Se quedo en Clasificado a proposito: el Risk Agent detecto una derivacion urgente.
                    derivadosUrgente++;
                }
                else
                {
                    procesadosOk++;
                }
            }
            catch
            {
                // Uno que vuelva a fallar no debe bloquear el reprocesamiento del resto.
                fallidos++;
            }
        }

        return new ReprocesarPendientesDto(pendientes.Count, procesadosOk, derivadosUrgente, fallidos);
    }
}
