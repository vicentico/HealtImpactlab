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

    public Task AddAsync(Paciente paciente, CancellationToken ct = default) =>
        context.Pacientes.InsertOneAsync(paciente.ToDocument(), cancellationToken: ct);

    public Task UpdateAsync(Paciente paciente, CancellationToken ct = default) =>
        context.Pacientes.ReplaceOneAsync(p => p.Id == paciente.Id, paciente.ToDocument(), cancellationToken: ct);
}
