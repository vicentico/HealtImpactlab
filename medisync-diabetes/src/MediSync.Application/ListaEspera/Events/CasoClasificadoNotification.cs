using MediatR;

namespace MediSync.Application.ListaEspera.Events;

/// <summary>
/// Simula el "Event Bus" pedido en la especificación: se publica cuando un caso entra Clasificado
/// a la lista de espera, y dispara de forma desacoplada el cálculo de riesgo/prioridad vía IA.
/// </summary>
public record CasoClasificadoNotification(string ListaEsperaItemId) : INotification;
