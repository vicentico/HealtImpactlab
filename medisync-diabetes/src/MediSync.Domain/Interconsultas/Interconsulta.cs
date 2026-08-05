using MediSync.Domain.Common;

namespace MediSync.Domain.Interconsultas;

public class Interconsulta : Entity
{
    public string PacienteId { get; private set; } = string.Empty;
    public string EspecialidadId { get; private set; } = string.Empty;
    public string CesfamOrigenId { get; private set; } = string.Empty;
    public DateTime FechaDerivacion { get; private set; }
    public string Motivo { get; private set; } = string.Empty;
    public EstadoInterconsulta Estado { get; private set; } = EstadoInterconsulta.Registrada;

    private Interconsulta() { }

    public Interconsulta(string pacienteId, string especialidadId, string cesfamOrigenId, string motivo, DateTime? fechaDerivacion = null)
    {
        PacienteId = pacienteId;
        EspecialidadId = especialidadId;
        CesfamOrigenId = cesfamOrigenId;
        Motivo = motivo;
        FechaDerivacion = fechaDerivacion ?? DateTime.UtcNow;
        Estado = EstadoInterconsulta.Registrada;
    }

    /// <summary>Rehidratación desde persistencia (uso exclusivo de MediSync.Infrastructure).</summary>
    internal Interconsulta(string id, string pacienteId, string especialidadId, string cesfamOrigenId, string motivo, DateTime fechaDerivacion, EstadoInterconsulta estado)
    {
        Id = id;
        PacienteId = pacienteId;
        EspecialidadId = especialidadId;
        CesfamOrigenId = cesfamOrigenId;
        Motivo = motivo;
        FechaDerivacion = fechaDerivacion;
        Estado = estado;
    }

    public void MarcarDerivada() => Estado = EstadoInterconsulta.Derivada;

    public int DiasDesdeDerivacion(DateTime? ahora = null) => ((ahora ?? DateTime.UtcNow) - FechaDerivacion).Days;
}
