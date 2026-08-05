using MediatR;
using MediSync.Application.Priorizacion.Commands;

namespace MediSync.Application.ListaEspera.Events;

public class CasoClasificadoNotificationHandler(ISender sender) : INotificationHandler<CasoClasificadoNotification>
{
    public Task Handle(CasoClasificadoNotification notification, CancellationToken cancellationToken) =>
        sender.Send(new CalcularPriorizacionCommand(notification.ListaEsperaItemId), cancellationToken);
}
