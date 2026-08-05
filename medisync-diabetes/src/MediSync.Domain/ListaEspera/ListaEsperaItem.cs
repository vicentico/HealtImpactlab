using MediSync.Domain.Common;

namespace MediSync.Domain.ListaEspera;

public class ListaEsperaItem : Entity
{
    private static readonly Dictionary<EstadoCaso, EstadoCaso[]> TransicionesPermitidas = new()
    {
        [EstadoCaso.EnEspera] = [EstadoCaso.Clasificado],
        [EstadoCaso.Clasificado] = [EstadoCaso.Priorizado],
        [EstadoCaso.Priorizado] = [EstadoCaso.EnRevision],
        [EstadoCaso.EnRevision] = [EstadoCaso.Agendado],
        [EstadoCaso.Agendado] = [EstadoCaso.Confirmado],
        [EstadoCaso.Confirmado] = [EstadoCaso.Atendido],
        [EstadoCaso.Atendido] = [EstadoCaso.Cerrado],
        [EstadoCaso.Cerrado] = []
    };

    public string InterconsultaId { get; private set; } = string.Empty;
    public string PacienteId { get; private set; } = string.Empty;
    public string EspecialidadId { get; private set; } = string.Empty;
    public EstadoCaso Estado { get; private set; } = EstadoCaso.EnEspera;
    public DateTime FechaIngreso { get; private set; }

    private ListaEsperaItem() { }

    public ListaEsperaItem(string interconsultaId, string pacienteId, string especialidadId)
    {
        InterconsultaId = interconsultaId;
        PacienteId = pacienteId;
        EspecialidadId = especialidadId;
        Estado = EstadoCaso.EnEspera;
        FechaIngreso = DateTime.UtcNow;
    }

    /// <summary>Rehidratación desde persistencia (uso exclusivo de MediSync.Infrastructure).</summary>
    internal ListaEsperaItem(string id, string interconsultaId, string pacienteId, string especialidadId, EstadoCaso estado, DateTime fechaIngreso)
    {
        Id = id;
        InterconsultaId = interconsultaId;
        PacienteId = pacienteId;
        EspecialidadId = especialidadId;
        Estado = estado;
        FechaIngreso = fechaIngreso;
    }

    public Result TransicionarA(EstadoCaso nuevoEstado)
    {
        if (!TransicionesPermitidas.TryGetValue(Estado, out var permitidas) || !permitidas.Contains(nuevoEstado))
        {
            return Result.Failure($"Transicion invalida: {Estado} -> {nuevoEstado}");
        }

        Estado = nuevoEstado;
        return Result.Success();
    }

    public int DiasEnEspera(DateTime? ahora = null) => ((ahora ?? DateTime.UtcNow) - FechaIngreso).Days;
}
