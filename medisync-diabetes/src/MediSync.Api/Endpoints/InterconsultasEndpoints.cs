using MediatR;
using MediSync.Application.Interconsultas.Commands;

namespace MediSync.Api.Endpoints;

public static class InterconsultasEndpoints
{
    public static void MapInterconsultasEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/interconsultas").WithTags("Interconsultas");

        group.MapPost("/", async (RegistrarInterconsultaRequest request, ISender sender, CancellationToken ct) =>
        {
            var id = await sender.Send(new RegistrarInterconsultaCommand(
                request.PacienteId, request.EspecialidadId, request.Motivo,
                request.HbA1c, request.GlicemiaAyunas, request.Comorbilidades), ct);
            return Results.Created($"/api/casos/{id}", new { listaEsperaItemId = id });
        });
    }

    public record RegistrarInterconsultaRequest(
        string PacienteId, string EspecialidadId, string Motivo,
        double HbA1c, double GlicemiaAyunas, List<string>? Comorbilidades);
}
