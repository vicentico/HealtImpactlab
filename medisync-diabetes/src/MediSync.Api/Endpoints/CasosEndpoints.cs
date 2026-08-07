using MediatR;
using MediSync.Application.Agenda.Commands;
using MediSync.Application.ListaEspera.Commands;
using MediSync.Application.ListaEspera.Queries;
using MediSync.Application.Priorizacion.Commands;
using MediSync.Domain.Priorizacion;

namespace MediSync.Api.Endpoints;

public static class CasosEndpoints
{
    public static void MapCasosEndpoints(this WebApplication app)
    {
        app.MapGet("/api/lista-espera", async (ISender sender, CancellationToken ct) =>
            Results.Ok(await sender.Send(new ListarListaEsperaQuery(), ct)))
            .WithTags("ListaEspera");

        app.MapPost("/api/lista-espera/reprocesar", async (ISender sender, CancellationToken ct) =>
            Results.Ok(await sender.Send(new ReprocesarPendientesCommand(), ct)))
            .WithTags("ListaEspera");

        app.MapGet("/api/kpis", async (ISender sender, CancellationToken ct) =>
            Results.Ok(await sender.Send(new ObtenerKpisQuery(), ct)))
            .WithTags("Kpis");

        app.MapGet("/api/matriz-riesgo", async (ISender sender, CancellationToken ct) =>
            Results.Ok(await sender.Send(new ObtenerMatrizRiesgoQuery(), ct)))
            .WithTags("MatrizRiesgo");

        var group = app.MapGroup("/api/casos").WithTags("Casos");

        group.MapGet("/{id}", async (string id, ISender sender, CancellationToken ct) =>
            Results.Ok(await sender.Send(new ObtenerCasoQuery(id), ct)));

        group.MapPatch("/{id}/revision", async (string id, RevisarCasoRequest request, ISender sender, CancellationToken ct) =>
        {
            var tier = Enum.Parse<PriorityTier>(request.PrioridadConfirmada, ignoreCase: true);
            await sender.Send(new RevisarCasoCommand(id, request.AprobadoPor, tier), ct);
            return Results.NoContent();
        });

        group.MapPost("/{id}/confirmar", async (string id, ISender sender, CancellationToken ct) =>
        {
            await sender.Send(new ConfirmarAgendaCommand(id), ct);
            return Results.NoContent();
        });

        group.MapPost("/{id}/atender", async (string id, ISender sender, CancellationToken ct) =>
        {
            await sender.Send(new RegistrarAtencionCommand(id), ct);
            return Results.NoContent();
        });

        group.MapPost("/{id}/cerrar", async (string id, ISender sender, CancellationToken ct) =>
        {
            await sender.Send(new CerrarCasoCommand(id), ct);
            return Results.NoContent();
        });
    }

    public record RevisarCasoRequest(string AprobadoPor, string PrioridadConfirmada);
}
