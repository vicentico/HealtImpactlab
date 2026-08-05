using MediSync.Domain.Common;

namespace MediSync.Domain.Catalogos;

public class Profesional : Entity
{
    public string Nombre { get; private set; } = string.Empty;
    public string EspecialidadId { get; private set; } = string.Empty;
    public string CentroSaludId { get; private set; } = string.Empty;

    private Profesional() { }

    public Profesional(string id, string nombre, string especialidadId, string centroSaludId)
    {
        Id = id;
        Nombre = nombre;
        EspecialidadId = especialidadId;
        CentroSaludId = centroSaludId;
    }
}
