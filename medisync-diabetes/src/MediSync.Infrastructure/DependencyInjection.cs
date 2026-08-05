using MediSync.Application.Abstractions;
using MediSync.Infrastructure.Persistence;
using MediSync.Infrastructure.Persistence.Repositories;
using MediSync.Infrastructure.Seed;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MediSync.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddMediSyncInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<MongoOptions>(configuration.GetSection(MongoOptions.SectionName));
        services.AddSingleton<MongoContext>();

        services.AddScoped<IPacienteRepository, PacienteRepository>();
        services.AddScoped<IInterconsultaRepository, InterconsultaRepository>();
        services.AddScoped<IListaEsperaRepository, ListaEsperaRepository>();
        services.AddScoped<IPriorizacionRepository, PriorizacionRepository>();
        services.AddScoped<IAgendaSlotRepository, AgendaSlotRepository>();
        services.AddScoped<ICasoEventoRepository, CasoEventoRepository>();
        services.AddScoped<IAgentExecutionLogRepository, AgentExecutionLogRepository>();
        services.AddScoped<IDecisionLogRepository, DecisionLogRepository>();
        services.AddScoped<IEspecialidadRepository, EspecialidadRepository>();
        services.AddScoped<ICentroSaludRepository, CentroSaludRepository>();
        services.AddScoped<IProfesionalRepository, ProfesionalRepository>();

        services.AddScoped<DummyDataSeeder>();

        return services;
    }
}
