using MediSync.Application.Abstractions;
using MediSync.Domain.Auditoria;
using MediSync.Infrastructure.Persistence.Documents;
using MongoDB.Driver;

namespace MediSync.Infrastructure.Persistence.Repositories;

public class CasoEventoRepository(MongoContext context) : ICasoEventoRepository
{
    public async Task<IReadOnlyList<CasoEvento>> GetByListaEsperaItemIdAsync(string listaEsperaItemId, CancellationToken ct = default)
    {
        var docs = await context.CasoEventos.Find(x => x.ListaEsperaItemId == listaEsperaItemId).ToListAsync(ct);
        return docs.Select(d => d.ToDomain()).ToList();
    }

    public async Task<IReadOnlyList<CasoEvento>> GetAllAsync(CancellationToken ct = default)
    {
        var docs = await context.CasoEventos.Find(FilterDefinition<CasoEventoDocument>.Empty).ToListAsync(ct);
        return docs.Select(d => d.ToDomain()).ToList();
    }

    public Task AddAsync(CasoEvento evento, CancellationToken ct = default) =>
        context.CasoEventos.InsertOneAsync(evento.ToDocument(), cancellationToken: ct);
}

public class AgentExecutionLogRepository(MongoContext context) : IAgentExecutionLogRepository
{
    public async Task<IReadOnlyList<AgentExecutionLog>> GetByListaEsperaItemIdAsync(string listaEsperaItemId, CancellationToken ct = default)
    {
        var docs = await context.AgentExecutionLogs.Find(x => x.ListaEsperaItemId == listaEsperaItemId).ToListAsync(ct);
        return docs.Select(d => d.ToDomain()).ToList();
    }

    public Task AddAsync(AgentExecutionLog log, CancellationToken ct = default) =>
        context.AgentExecutionLogs.InsertOneAsync(log.ToDocument(), cancellationToken: ct);
}

public class DecisionLogRepository(MongoContext context) : IDecisionLogRepository
{
    public async Task<IReadOnlyList<DecisionLog>> GetByListaEsperaItemIdAsync(string listaEsperaItemId, CancellationToken ct = default)
    {
        var docs = await context.DecisionLogs.Find(x => x.ListaEsperaItemId == listaEsperaItemId).ToListAsync(ct);
        return docs.Select(d => d.ToDomain()).ToList();
    }

    public Task AddAsync(DecisionLog log, CancellationToken ct = default) =>
        context.DecisionLogs.InsertOneAsync(log.ToDocument(), cancellationToken: ct);
}
