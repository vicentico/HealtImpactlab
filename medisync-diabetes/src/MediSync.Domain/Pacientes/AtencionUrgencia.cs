namespace MediSync.Domain.Pacientes;

/// <summary>
/// Evento de atencion en SAPU/SAR/UEH con fecha real — alimenta el criterio C3 (Uso de Urgencia) del
/// Protocolo Algoritmico MINSAL, que necesita contar eventos en ventanas de 1 y 6 meses (ver
/// docs/11-protocolo-minsal-prompt.md). Tambien es la fuente que puede usarse para derivar
/// <see cref="AntecedenteClinico.UrgenciasUltimos90Dias"/> (el contador que consume el modelo ECICEP)
/// contando estos eventos en los ultimos 90 dias, en vez de tipearlo a mano.
/// </summary>
public record AtencionUrgencia(DateTime Fecha, string Motivo);
