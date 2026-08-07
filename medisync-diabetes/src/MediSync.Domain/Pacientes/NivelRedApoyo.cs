namespace MediSync.Domain.Pacientes;

/// <summary>
/// Factor Riesgo Social/Redes (C4) del Protocolo Algoritmico MINSAL — clasificacion estructurada en
/// 3 niveles (ver docs/ECICEP_MODELO_TECNICO_OPERATIVO.md, seccion 5, y docs/11-protocolo-minsal-prompt.md).
/// Distinto de <see cref="Paciente.DeterminantesSociales"/> (texto libre, usado por el modelo ECICEP):
/// este campo es la version estructurada y auditable que exige el protocolo MINSAL.
/// </summary>
public enum NivelRedApoyo
{
    RedEfectiva,
    RedParcial,
    SinRedOAbandono
}
