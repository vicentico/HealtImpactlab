using MediatR;
using MediSync.Application.Pacientes.Commands;

namespace MediSync.Api.Endpoints;

public static class PacientesEndpoints
{
    public static void MapPacientesEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/pacientes").WithTags("Pacientes");

        group.MapPost("/", async (RegistrarPacienteRequest request, ISender sender, CancellationToken ct) =>
        {
            var id = await sender.Send(new RegistrarPacienteCommand(
                request.Run, request.Nombre, request.FechaNacimiento, request.CesfamOrigenId), ct);
            return Results.Created($"/api/pacientes/{id}", new { pacienteId = id });
        });
    }

    public record RegistrarPacienteRequest(string Run, string Nombre, DateTime FechaNacimiento, string CesfamOrigenId);
}
