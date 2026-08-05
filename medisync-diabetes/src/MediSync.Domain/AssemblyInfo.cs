using System.Runtime.CompilerServices;

// Permite que la capa de persistencia rehidrate entidades desde MongoDB usando
// constructores internos, sin exponer setters públicos que violen las invariantes de dominio.
[assembly: InternalsVisibleTo("MediSync.Infrastructure")]
