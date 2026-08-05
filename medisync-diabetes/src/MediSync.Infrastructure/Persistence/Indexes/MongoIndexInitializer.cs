using MediSync.Infrastructure.Persistence.Documents;
using MongoDB.Driver;

namespace MediSync.Infrastructure.Persistence.Indexes;

/// <summary>
/// Índices mínimos que reflejan los patrones de consulta reales de la PoC (ver docs/06-modelo-datos-mongodb.md):
/// filtrar lista de espera por especialidad+estado, y resolver rápidamente cupos disponibles.
/// </summary>
public static class MongoIndexInitializer
{
    public static async Task EnsureIndexesAsync(MongoContext context, CancellationToken ct = default)
    {
        var listaEsperaIndexes = new[]
        {
            new CreateIndexModel<ListaEsperaItemDocument>(
                Builders<ListaEsperaItemDocument>.IndexKeys.Ascending(x => x.EspecialidadId).Ascending(x => x.Estado)),
            new CreateIndexModel<ListaEsperaItemDocument>(
                Builders<ListaEsperaItemDocument>.IndexKeys.Ascending(x => x.PacienteId))
        };
        await context.ListaEsperaItems.Indexes.CreateManyAsync(listaEsperaIndexes, ct);

        await context.Priorizaciones.Indexes.CreateOneAsync(
            new CreateIndexModel<PriorizacionDocument>(Builders<PriorizacionDocument>.IndexKeys.Ascending(x => x.ListaEsperaItemId)),
            cancellationToken: ct);

        var agendaIndexes = new[]
        {
            new CreateIndexModel<AgendaSlotDocument>(
                Builders<AgendaSlotDocument>.IndexKeys.Ascending(x => x.EspecialidadId).Ascending(x => x.Disponible).Ascending(x => x.FechaHora)),
            new CreateIndexModel<AgendaSlotDocument>(
                Builders<AgendaSlotDocument>.IndexKeys.Ascending(x => x.ListaEsperaItemId))
        };
        await context.AgendaSlots.Indexes.CreateManyAsync(agendaIndexes, ct);
    }
}
