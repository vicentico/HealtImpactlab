using MediatR;
using MediSync.Application.Abstractions;

namespace MediSync.Application.Pacientes.Queries;

public record AntecedenteHistorialDto(
    double HbA1c, double GlicemiaAyunas, IReadOnlyList<string> Comorbilidades, DateTime FechaRegistro,
    double? Vfg, double? MicroalbuminuriaRac, bool NeuropatiaPrevia, int UrgenciasUltimos90Dias,
    IReadOnlyList<string> AlertasClinicas, int NumeroFarmacosActivos);

public record AtencionUrgenciaDto(DateTime Fecha, string Motivo);

public record HospitalizacionDto(DateTime FechaIngreso, DateTime? FechaAlta, string Motivo);

public record PacienteDetalleDto(
    string PacienteId, string Nombre, string Run, DateTime FechaNacimiento, int Edad, string CesfamOrigenId,
    bool DependenciaSevera, bool Ruralidad, IReadOnlyList<string> DeterminantesSociales, string? NivelRedApoyo,
    IReadOnlyList<AntecedenteHistorialDto> Antecedentes,
    IReadOnlyList<AtencionUrgenciaDto> AtencionesUrgencia,
    IReadOnlyList<HospitalizacionDto> Hospitalizaciones);

public record ObtenerPacienteQuery(string PacienteId) : IRequest<PacienteDetalleDto>;

public class ObtenerPacienteQueryHandler(IPacienteRepository pacientes)
    : IRequestHandler<ObtenerPacienteQuery, PacienteDetalleDto>
{
    public async Task<PacienteDetalleDto> Handle(ObtenerPacienteQuery request, CancellationToken cancellationToken)
    {
        var p = await pacientes.GetByIdAsync(request.PacienteId, cancellationToken)
            ?? throw new InvalidOperationException($"Paciente {request.PacienteId} no existe.");

        return new PacienteDetalleDto(
            p.Id, p.Nombre, p.Run, p.FechaNacimiento, p.EdadEnAnios(), p.CesfamOrigenId,
            p.DependenciaSevera, p.Ruralidad, p.DeterminantesSociales, p.NivelRedApoyo?.ToString(),
            p.Antecedentes.OrderByDescending(a => a.FechaRegistro).Select(a => new AntecedenteHistorialDto(
                a.HbA1c, a.GlicemiaAyunas, a.Comorbilidades, a.FechaRegistro, a.Vfg, a.MicroalbuminuriaRac,
                a.NeuropatiaPrevia, a.UrgenciasUltimos90Dias, a.AlertasClinicas, a.NumeroFarmacosActivos)).ToList(),
            p.AtencionesUrgencia.OrderByDescending(a => a.Fecha)
                .Select(a => new AtencionUrgenciaDto(a.Fecha, a.Motivo)).ToList(),
            p.Hospitalizaciones.OrderByDescending(h => h.FechaIngreso)
                .Select(h => new HospitalizacionDto(h.FechaIngreso, h.FechaAlta, h.Motivo)).ToList());
    }
}
