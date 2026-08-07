namespace MediSync.Domain.Priorizacion;

/// <summary>
/// Prioridad segun el Protocolo Algoritmico de Priorizacion para la Lista de Espera de APS (DM2)
/// del MINSAL (ver docs/ECICEP_MODELO_TECNICO_OPERATIVO.md, seccion 5, y docs/11-protocolo-minsal-prompt.md).
/// Deliberadamente distinta de <see cref="PriorityTier"/> (P1/P2/P3, modelo ECICEP): son dos evidencias
/// de priorizacion independientes, no se mezclan entre si.
/// </summary>
public enum PrioridadMinsal
{
    Baja,
    Media,
    Alta
}
