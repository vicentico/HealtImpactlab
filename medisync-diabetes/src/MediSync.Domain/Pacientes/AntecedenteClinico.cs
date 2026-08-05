namespace MediSync.Domain.Pacientes;

public record AntecedenteClinico(
    double HbA1c,
    double GlicemiaAyunas,
    IReadOnlyList<string> Comorbilidades,
    DateTime FechaRegistro);
