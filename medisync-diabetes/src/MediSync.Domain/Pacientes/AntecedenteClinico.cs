namespace MediSync.Domain.Pacientes;

/// <summary>
/// Datos clinicos usados por el Score de Criticidad Real ECICEP (ver docs/08-analisis-ecicep-prompt.md):
/// Vfg/MicroalbuminuriaRac/NeuropatiaPrevia alimentan el factor Severidad (W1), UrgenciasUltimos90Dias
/// alimenta Urgencia_Reciente (W2), y AlertasClinicas dispara la derivacion urgente automatica.
/// </summary>
public record AntecedenteClinico(
    double HbA1c,
    double GlicemiaAyunas,
    IReadOnlyList<string> Comorbilidades,
    DateTime FechaRegistro,
    double? Vfg = null,
    double? MicroalbuminuriaRac = null,
    bool NeuropatiaPrevia = false,
    int UrgenciasUltimos90Dias = 0,
    IReadOnlyList<string>? AlertasClinicas = null)
{
    public IReadOnlyList<string> AlertasClinicas { get; init; } = AlertasClinicas ?? [];
}
