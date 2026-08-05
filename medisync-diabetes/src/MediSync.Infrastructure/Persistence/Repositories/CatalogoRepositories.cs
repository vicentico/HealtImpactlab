using MediSync.Application.Abstractions;
using MediSync.Domain.Catalogos;
using MediSync.Infrastructure.Persistence.Documents;
using MongoDB.Driver;

namespace MediSync.Infrastructure.Persistence.Repositories;

public class EspecialidadRepository(MongoContext context) : IEspecialidadRepository
{
    public async Task<Especialidad?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        var doc = await context.Especialidades.Find(x => x.Id == id).FirstOrDefaultAsync(ct);
        return doc?.ToDomain();
    }

    public async Task<IReadOnlyList<Especialidad>> GetAllAsync(CancellationToken ct = default)
    {
        var docs = await context.Especialidades.Find(FilterDefinition<EspecialidadDocument>.Empty).ToListAsync(ct);
        return docs.Select(d => d.ToDomain()).ToList();
    }
}

public class CentroSaludRepository(MongoContext context) : ICentroSaludRepository
{
    public async Task<CentroSalud?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        var doc = await context.CentrosSalud.Find(x => x.Id == id).FirstOrDefaultAsync(ct);
        return doc?.ToDomain();
    }

    public async Task<IReadOnlyList<CentroSalud>> GetAllAsync(CancellationToken ct = default)
    {
        var docs = await context.CentrosSalud.Find(FilterDefinition<CentroSaludDocument>.Empty).ToListAsync(ct);
        return docs.Select(d => d.ToDomain()).ToList();
    }
}

public class ProfesionalRepository(MongoContext context) : IProfesionalRepository
{
    public async Task<Profesional?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        var doc = await context.Profesionales.Find(x => x.Id == id).FirstOrDefaultAsync(ct);
        return doc?.ToDomain();
    }

    public async Task<IReadOnlyList<Profesional>> GetByEspecialidadAsync(string especialidadId, CancellationToken ct = default)
    {
        var docs = await context.Profesionales.Find(x => x.EspecialidadId == especialidadId).ToListAsync(ct);
        return docs.Select(d => d.ToDomain()).ToList();
    }
}
