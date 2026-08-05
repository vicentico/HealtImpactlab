using MediSync.Domain.Common;

namespace MediSync.Domain.Catalogos;

public class Especialidad : Entity
{
    public string Nombre { get; private set; } = string.Empty;

    private Especialidad() { }

    public Especialidad(string id, string nombre)
    {
        Id = id;
        Nombre = nombre;
    }
}
