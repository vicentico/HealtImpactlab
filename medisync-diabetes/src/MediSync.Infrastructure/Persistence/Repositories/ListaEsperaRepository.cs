using MediSync.Application.Abstractions;
using MediSync.Domain.ListaEspera;
using MediSync.Infrastructure.Persistence.Documents;
using MongoDB.Driver;

namespace MediSync.Infrastructure.Persistence.Repositories;

public class ListaEsperaRepository(MongoContext context) : IListaEsperaRepository
{
    public async Task<ListaEsperaItem?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        var doc = await context.ListaEsperaItems.Find(x => x.Id == id).FirstOrDefaultAsync(ct);
        return doc?.ToDomain();
    }

    public async Task<IReadOnlyList<ListaEsperaItem>> GetAllAsync(CancellationToken ct = default)
    {
        var docs = await context.ListaEsperaItems.Find(FilterDefinition<ListaEsperaItemDocument>.Empty).ToListAsync(ct);
        return docs.Select(d => d.ToDomain()).ToList();
    }

    public async Task<int> CountEnEsperaPorEspecialidadAsync(string especialidadId, CancellationToken ct = default)
    {
        var estadosEnCurso = new[]
        {
            EstadoCaso.EnEspera, EstadoCaso.Clasificado, EstadoCaso.Priorizado, EstadoCaso.EnRevision, EstadoCaso.Agendado
        };
        var filter = Builders<ListaEsperaItemDocument>.Filter.Eq(x => x.EspecialidadId, especialidadId) &
                     Builders<ListaEsperaItemDocument>.Filter.In(x => x.Estado, estadosEnCurso);
        var count = await context.ListaEsperaItems.CountDocumentsAsync(filter, cancellationToken: ct);
        return (int)count;
    }

    public Task AddAsync(ListaEsperaItem item, CancellationToken ct = default) =>
        context.ListaEsperaItems.InsertOneAsync(item.ToDocument(), cancellationToken: ct);

    public Task UpdateAsync(ListaEsperaItem item, CancellationToken ct = default) =>
        context.ListaEsperaItems.ReplaceOneAsync(x => x.Id == item.Id, item.ToDocument(), cancellationToken: ct);
}
