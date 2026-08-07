using MediSync.Domain.Common;

namespace MediSync.Domain.Pacientes;

public class Paciente : Entity
{
    public string Run { get; private set; } = string.Empty;
    public string Nombre { get; private set; } = string.Empty;
    public DateTime FechaNacimiento { get; private set; }
    public string CesfamOrigenId { get; private set; } = string.Empty;
    public List<AntecedenteClinico> Antecedentes { get; private set; } = [];

    /// <summary>Factor Vulnerabilidad (W4) del Score de Criticidad Real ECICEP.</summary>
    public bool DependenciaSevera { get; private set; }
    public bool Ruralidad { get; private set; }
    public List<string> DeterminantesSociales { get; private set; } = [];

    /// <summary>Factor C4 (Riesgo Social/Redes) del Protocolo Algoritmico MINSAL — clasificacion
    /// estructurada, distinta de <see cref="DeterminantesSociales"/> (texto libre).</summary>
    public NivelRedApoyo? NivelRedApoyo { get; private set; }

    /// <summary>Historial con fecha real, usado por el criterio C3 del Protocolo MINSAL
    /// (ver docs/11-protocolo-minsal-prompt.md).</summary>
    public List<AtencionUrgencia> AtencionesUrgencia { get; private set; } = [];
    public List<Hospitalizacion> Hospitalizaciones { get; private set; } = [];

    private Paciente() { }

    public Paciente(
        string run, string nombre, DateTime fechaNacimiento, string cesfamOrigenId,
        bool dependenciaSevera = false, bool ruralidad = false, List<string>? determinantesSociales = null,
        NivelRedApoyo? nivelRedApoyo = null)
    {
        Run = run;
        Nombre = nombre;
        FechaNacimiento = fechaNacimiento;
        CesfamOrigenId = cesfamOrigenId;
        DependenciaSevera = dependenciaSevera;
        Ruralidad = ruralidad;
        DeterminantesSociales = determinantesSociales ?? [];
        NivelRedApoyo = nivelRedApoyo;
    }

    /// <summary>Rehidratación desde persistencia (uso exclusivo de MediSync.Infrastructure).</summary>
    internal Paciente(
        string id, string run, string nombre, DateTime fechaNacimiento, string cesfamOrigenId, List<AntecedenteClinico> antecedentes,
        bool dependenciaSevera, bool ruralidad, List<string> determinantesSociales, NivelRedApoyo? nivelRedApoyo,
        List<AtencionUrgencia> atencionesUrgencia, List<Hospitalizacion> hospitalizaciones)
    {
        Id = id;
        Run = run;
        Nombre = nombre;
        FechaNacimiento = fechaNacimiento;
        CesfamOrigenId = cesfamOrigenId;
        Antecedentes = antecedentes;
        DependenciaSevera = dependenciaSevera;
        Ruralidad = ruralidad;
        DeterminantesSociales = determinantesSociales;
        NivelRedApoyo = nivelRedApoyo;
        AtencionesUrgencia = atencionesUrgencia;
        Hospitalizaciones = hospitalizaciones;
    }

    public int EdadEnAnios(DateTime? ahora = null)
    {
        var referencia = ahora ?? DateTime.UtcNow;
        var edad = referencia.Year - FechaNacimiento.Year;
        if (FechaNacimiento.Date > referencia.AddYears(-edad)) edad--;
        return edad;
    }

    public void RegistrarAntecedente(AntecedenteClinico antecedente) => Antecedentes.Add(antecedente);

    public AntecedenteClinico? UltimoAntecedente() => Antecedentes.OrderByDescending(a => a.FechaRegistro).FirstOrDefault();

    public void RegistrarAtencionUrgencia(AtencionUrgencia atencion) => AtencionesUrgencia.Add(atencion);

    public void RegistrarHospitalizacion(Hospitalizacion hospitalizacion) => Hospitalizaciones.Add(hospitalizacion);

    public int ContarAtencionesUrgenciaDesde(DateTime desde) => AtencionesUrgencia.Count(a => a.Fecha >= desde);

    public int ContarHospitalizacionesDesde(DateTime desde) =>
        Hospitalizaciones.Count(h => h.FechaIngreso >= desde);
}
