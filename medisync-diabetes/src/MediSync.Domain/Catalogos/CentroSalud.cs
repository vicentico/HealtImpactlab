using MediSync.Domain.Common;

namespace MediSync.Domain.Catalogos;

public class CentroSalud : Entity
{
    public string Nombre { get; private set; } = string.Empty;
    public TipoCentroSalud Tipo { get; private set; }

    private CentroSalud() { }

    public CentroSalud(string id, string nombre, TipoCentroSalud tipo)
    {
        Id = id;
        Nombre = nombre;
        Tipo = tipo;
    }
}
