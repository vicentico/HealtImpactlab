using MediSync.Application.Abstractions;
using MediSync.Domain.Pacientes;
using MediSync.Infrastructure.Persistence.Documents;
using MongoDB.Driver;

namespace MediSync.Infrastructure.Persistence.Repositories;

public class PacienteRepository(MongoContext context) : IPacienteRepository
{
    public async Task<Paciente?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        var doc = await context.Pacientes.Find(p => p.Id == id).FirstOrDefaultAsync(ct);
        return doc?.ToDomain();
    }

    public async Task<IReadOnlyList<Paciente>> BuscarAsync(string? texto, CancellationToken ct = default)
    {
        var filtro = string.IsNullOrWhiteSpace(texto)
            ? FilterDefinition<PacienteDocument>.Empty
            : Builders<PacienteDocument>.Filter.Or(
                Builders<PacienteDocument>.Filter.Regex(p => p.Nombre, new MongoDB.Bson.BsonRegularExpression(texto, "i")),
                Builders<PacienteDocument>.Filter.Regex(p => p.Run, new MongoDB.Bson.BsonRegularExpression(texto, "i")));

        var docs = await context.Pacientes.Find(filtro).SortBy(p => p.Nombre).ToListAsync(ct);
        return docs.Select(d => d.ToDomain()).ToList();
    }

    public Task AddAsync(Paciente paciente, CancellationToken ct = default) =>
        context.Pacientes.InsertOneAsync(paciente.ToDocument(), cancellationToken: ct);

    public Task UpdateAsync(Paciente paciente, CancellationToken ct = default) =>
        context.Pacientes.ReplaceOneAsync(p => p.Id == paciente.Id, paciente.ToDocument(), cancellationToken: ct);
}
