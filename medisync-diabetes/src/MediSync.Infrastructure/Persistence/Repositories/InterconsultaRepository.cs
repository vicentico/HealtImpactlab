using MediSync.Application.Abstractions;
using MediSync.Domain.Interconsultas;
using MediSync.Infrastructure.Persistence.Documents;
using MongoDB.Driver;

namespace MediSync.Infrastructure.Persistence.Repositories;

public class InterconsultaRepository(MongoContext context) : IInterconsultaRepository
{
    public async Task<Interconsulta?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        var doc = await context.Interconsultas.Find(x => x.Id == id).FirstOrDefaultAsync(ct);
        return doc?.ToDomain();
    }

    public Task AddAsync(Interconsulta interconsulta, CancellationToken ct = default) =>
        context.Interconsultas.InsertOneAsync(interconsulta.ToDocument(), cancellationToken: ct);

    public Task UpdateAsync(Interconsulta interconsulta, CancellationToken ct = default) =>
        context.Interconsultas.ReplaceOneAsync(x => x.Id == interconsulta.Id, interconsulta.ToDocument(), cancellationToken: ct);
}
