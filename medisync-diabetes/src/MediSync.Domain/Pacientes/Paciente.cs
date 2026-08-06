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

    private Paciente() { }

    public Paciente(
        string run, string nombre, DateTime fechaNacimiento, string cesfamOrigenId,
        bool dependenciaSevera = false, bool ruralidad = false, List<string>? determinantesSociales = null)
    {
        Run = run;
        Nombre = nombre;
        FechaNacimiento = fechaNacimiento;
        CesfamOrigenId = cesfamOrigenId;
        DependenciaSevera = dependenciaSevera;
        Ruralidad = ruralidad;
        DeterminantesSociales = determinantesSociales ?? [];
    }

    /// <summary>Rehidratación desde persistencia (uso exclusivo de MediSync.Infrastructure).</summary>
    internal Paciente(
        string id, string run, string nombre, DateTime fechaNacimiento, string cesfamOrigenId, List<AntecedenteClinico> antecedentes,
        bool dependenciaSevera, bool ruralidad, List<string> determinantesSociales)
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
}
