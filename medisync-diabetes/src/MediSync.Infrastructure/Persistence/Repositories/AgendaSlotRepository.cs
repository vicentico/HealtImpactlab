using MediSync.Application.Abstractions;
using MediSync.Domain.Agenda;
using MediSync.Infrastructure.Persistence.Documents;
using MongoDB.Driver;

namespace MediSync.Infrastructure.Persistence.Repositories;

public class AgendaSlotRepository(MongoContext context) : IAgendaSlotRepository
{
    public async Task<AgendaSlot?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        var doc = await context.AgendaSlots.Find(x => x.Id == id).FirstOrDefaultAsync(ct);
        return doc?.ToDomain();
    }

    public async Task<IReadOnlyList<AgendaSlot>> GetDisponiblesPorEspecialidadAsync(string especialidadId, CancellationToken ct = default)
    {
        var filter = Builders<AgendaSlotDocument>.Filter.Eq(x => x.EspecialidadId, especialidadId) &
                     Builders<AgendaSlotDocument>.Filter.Eq(x => x.Disponible, true);
        var docs = await context.AgendaSlots.Find(filter).SortBy(x => x.FechaHora).ToListAsync(ct);
        return docs.Select(d => d.ToDomain()).ToList();
    }

    public async Task<AgendaSlot?> GetByListaEsperaItemIdAsync(string listaEsperaItemId, CancellationToken ct = default)
    {
        var doc = await context.AgendaSlots.Find(x => x.ListaEsperaItemId == listaEsperaItemId).FirstOrDefaultAsync(ct);
        return doc?.ToDomain();
    }

    public Task AddAsync(AgendaSlot slot, CancellationToken ct = default) =>
        context.AgendaSlots.InsertOneAsync(slot.ToDocument(), cancellationToken: ct);

    public Task UpdateAsync(AgendaSlot slot, CancellationToken ct = default) =>
        context.AgendaSlots.ReplaceOneAsync(x => x.Id == slot.Id, slot.ToDocument(), cancellationToken: ct);
}
