using MediSync.AI.Agents;
using MediSync.AI.Tools;
using MediSync.Application.Abstractions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MediSync.AI;

public static class DependencyInjection
{
    public static IServiceCollection AddMediSyncAI(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<AnthropicOptions>(configuration.GetSection(AnthropicOptions.SectionName));
        services.AddHttpClient<AnthropicClient>();

        services.AddScoped<IAgentTool, GetPatientClinicalDataTool>();
        services.AddScoped<IAgentTool, CheckEmergencyEscalationTool>();
        services.AddScoped<IAgentTool, GetReferenceRangesTool>();
        services.AddScoped<IAgentTool, GetWaitingListStatsTool>();
        services.AddScoped<IAgentTool, GetRiskAssessmentTool>();
        services.AddScoped<IAgentTool, RecordDecisionLogTool>();
        services.AddScoped<IAgentTool, GetAvailableSlotsTool>();
        services.AddScoped<IAgentTool, ReserveSlotTool>();
        services.AddScoped<IAgentTool, NotifyDummyChannelTool>();

        services.AddScoped<IReadOnlyDictionary<string, IAgentTool>>(sp =>
            sp.GetServices<IAgentTool>().ToDictionary(t => t.Name));

        services.AddScoped<AgentLoop>();
        services.AddScoped<IRiskAgent, RiskAgent>();
        services.AddScoped<IPriorityAgent, PriorityAgent>();
        services.AddScoped<ISchedulerAgent, SchedulerAgent>();

        return services;
    }
}
