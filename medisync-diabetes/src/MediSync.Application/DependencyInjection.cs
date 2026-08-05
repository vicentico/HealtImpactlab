using FluentValidation;
using MediatR;
using MediSync.Application.Behaviors;
using Microsoft.Extensions.DependencyInjection;

namespace MediSync.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddMediSyncApplication(this IServiceCollection services)
    {
        var assembly = typeof(DependencyInjection).Assembly;

        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(assembly);
            cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
        });

        services.AddValidatorsFromAssembly(assembly);

        return services;
    }
}
