using MediSync.Application.Abstractions;
using MediSync.Infrastructure.Persistence.Documents;
using MongoDB.Driver;
using PriorizacionEntity = MediSync.Domain.Priorizacion.Priorizacion;

namespace MediSync.Infrastructure.Persistence.Repositories;

public class PriorizacionRepository(MongoContext context) : IPriorizacionRepository
{
    public async Task<PriorizacionEntity?> GetByListaEsperaItemIdAsync(string listaEsperaItemId, CancellationToken ct = default)
    {
        var doc = await context.Priorizaciones.Find(x => x.ListaEsperaItemId == listaEsperaItemId).FirstOrDefaultAsync(ct);
        return doc?.ToDomain();
    }

    public Task AddAsync(PriorizacionEntity priorizacion, CancellationToken ct = default) =>
        context.Priorizaciones.InsertOneAsync(priorizacion.ToDocument(), cancellationToken: ct);

    public Task UpdateAsync(PriorizacionEntity priorizacion, CancellationToken ct = default) =>
        context.Priorizaciones.ReplaceOneAsync(x => x.Id == priorizacion.Id, priorizacion.ToDocument(), cancellationToken: ct);
}
