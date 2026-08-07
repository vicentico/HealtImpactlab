namespace MediSync.Domain.Pacientes;

/// <summary>
/// Hospitalizacion con fecha real — alimenta el criterio C3 (Uso de Urgencia) del Protocolo Algoritmico
/// MINSAL junto con <see cref="AtencionUrgencia"/> (ver docs/11-protocolo-minsal-prompt.md).
/// </summary>
public record Hospitalizacion(DateTime FechaIngreso, DateTime? FechaAlta, string Motivo);
