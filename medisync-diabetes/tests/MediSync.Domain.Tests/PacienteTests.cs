using MediSync.Domain.Pacientes;
using Xunit;

namespace MediSync.Domain.Tests;

public class PacienteTests
{
    [Fact]
    public void EdadEnAnios_CalculaCorrectamente_CuandoYaPasoElCumpleanos()
    {
        var paciente = new Paciente("11111111-1", "Juan Perez", new DateTime(1958, 3, 12), "cesfam-001");

        var edad = paciente.EdadEnAnios(new DateTime(2026, 8, 5));

        Assert.Equal(68, edad);
    }

    [Fact]
    public void EdadEnAnios_CalculaCorrectamente_CuandoAunNoLlegaElCumpleanos()
    {
        var paciente = new Paciente("11111111-1", "Juan Perez", new DateTime(1958, 12, 12), "cesfam-001");

        var edad = paciente.EdadEnAnios(new DateTime(2026, 8, 5));

        Assert.Equal(67, edad);
    }

    [Fact]
    public void UltimoAntecedente_DevuelveElMasReciente()
    {
        var paciente = new Paciente("11111111-1", "Juan Perez", new DateTime(1958, 3, 12), "cesfam-001");
        paciente.RegistrarAntecedente(new AntecedenteClinico(7.0, 130, [], new DateTime(2026, 1, 1)));
        paciente.RegistrarAntecedente(new AntecedenteClinico(9.2, 180, ["Hipertension"], new DateTime(2026, 6, 1)));

        var ultimo = paciente.UltimoAntecedente();

        Assert.NotNull(ultimo);
        Assert.Equal(9.2, ultimo!.HbA1c);
    }
}
