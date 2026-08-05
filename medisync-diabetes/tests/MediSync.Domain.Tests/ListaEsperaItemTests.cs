using MediSync.Domain.ListaEspera;
using Xunit;

namespace MediSync.Domain.Tests;

public class ListaEsperaItemTests
{
    [Fact]
    public void TransicionarA_SiguienteEstadoValido_RetornaSuccess()
    {
        var item = new ListaEsperaItem("interconsulta-1", "paciente-1", "diabetologia");

        var result = item.TransicionarA(EstadoCaso.Clasificado);

        Assert.True(result.IsSuccess);
        Assert.Equal(EstadoCaso.Clasificado, item.Estado);
    }

    [Fact]
    public void TransicionarA_SaltandoEstados_RetornaFailureYNoCambiaEstado()
    {
        var item = new ListaEsperaItem("interconsulta-1", "paciente-1", "diabetologia");

        var result = item.TransicionarA(EstadoCaso.Agendado);

        Assert.False(result.IsSuccess);
        Assert.Equal(EstadoCaso.EnEspera, item.Estado);
    }

    [Fact]
    public void TransicionarA_DesdeCerrado_SiempreFalla()
    {
        var item = new ListaEsperaItem("interconsulta-1", "paciente-1", "diabetologia");
        foreach (var estado in new[]
        {
            EstadoCaso.Clasificado, EstadoCaso.Priorizado, EstadoCaso.EnRevision,
            EstadoCaso.Agendado, EstadoCaso.Confirmado, EstadoCaso.Atendido, EstadoCaso.Cerrado
        })
        {
            Assert.True(item.TransicionarA(estado).IsSuccess);
        }

        var result = item.TransicionarA(EstadoCaso.EnEspera);

        Assert.False(result.IsSuccess);
    }
}
