using MediatR;
using MediSync.Application.Pacientes.Commands;
using MediSync.Application.Pacientes.Queries;
using MediSync.Domain.Pacientes;

namespace MediSync.Api.Endpoints;

public static class PacientesEndpoints
{
    public static void MapPacientesEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/pacientes").WithTags("Pacientes");

        group.MapGet("/", async (string? q, ISender sender, CancellationToken ct) =>
            Results.Ok(await sender.Send(new ListarPacientesQuery(q), ct)));

        group.MapGet("/{id}", async (string id, ISender sender, CancellationToken ct) =>
            Results.Ok(await sender.Send(new ObtenerPacienteQuery(id), ct)));

        group.MapPost("/", async (RegistrarPacienteRequest request, ISender sender, CancellationToken ct) =>
        {
            var id = await sender.Send(new RegistrarPacienteCommand(
                request.Run, request.Nombre, request.FechaNacimiento, request.CesfamOrigenId,
                request.DependenciaSevera, request.Ruralidad, request.DeterminantesSociales,
                request.NivelRedApoyo), ct);
            return Results.Created($"/api/pacientes/{id}", new { pacienteId = id });
        });
    }

    public record RegistrarPacienteRequest(
        string Run, string Nombre, DateTime FechaNacimiento, string CesfamOrigenId,
        bool DependenciaSevera = false, bool Ruralidad = false, List<string>? DeterminantesSociales = null,
        NivelRedApoyo? NivelRedApoyo = null);
}
