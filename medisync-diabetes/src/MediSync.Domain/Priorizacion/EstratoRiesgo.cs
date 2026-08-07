namespace MediSync.Domain.Priorizacion;

/// <summary>
/// Estrato de riesgo poblacional segun la matriz de estratificacion ECICEP con foco en DM2
/// (ver docs/ECICEP_MODELO_TECNICO_OPERATIVO.md, seccion 3). No incluye G0 (sano/sin condiciones
/// cronicas): todo paciente que llega a este sistema ya fue derivado por una interconsulta de
/// especialidad, por lo tanto nunca es G0.
/// </summary>
public enum EstratoRiesgo
{
    G1,
    G2,
    G3
}
