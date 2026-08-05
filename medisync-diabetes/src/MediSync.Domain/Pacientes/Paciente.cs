using MediSync.Domain.Common;

namespace MediSync.Domain.Pacientes;

public class Paciente : Entity
{
    public string Run { get; private set; } = string.Empty;
    public string Nombre { get; private set; } = string.Empty;
    public DateTime FechaNacimiento { get; private set; }
    public string CesfamOrigenId { get; private set; } = string.Empty;
    public List<AntecedenteClinico> Antecedentes { get; private set; } = [];

    private Paciente() { }

    public Paciente(string run, string nombre, DateTime fechaNacimiento, string cesfamOrigenId)
    {
        Run = run;
        Nombre = nombre;
        FechaNacimiento = fechaNacimiento;
        CesfamOrigenId = cesfamOrigenId;
    }

    /// <summary>Rehidratación desde persistencia (uso exclusivo de MediSync.Infrastructure).</summary>
    internal Paciente(string id, string run, string nombre, DateTime fechaNacimiento, string cesfamOrigenId, List<AntecedenteClinico> antecedentes)
    {
        Id = id;
        Run = run;
        Nombre = nombre;
        FechaNacimiento = fechaNacimiento;
        CesfamOrigenId = cesfamOrigenId;
        Antecedentes = antecedentes;
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
