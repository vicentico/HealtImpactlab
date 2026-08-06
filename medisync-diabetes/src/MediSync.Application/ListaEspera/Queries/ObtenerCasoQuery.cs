using MediatR;
using MediSync.Application.Abstractions;
using MediSync.Domain.Auditoria;
using MediSync.Domain.ListaEspera;

namespace MediSync.Application.ListaEspera.Queries;

public record CasoDetalleDto(
    string ListaEsperaItemId,
    string Estado,
    int DiasEnEspera,
    string PacienteId,
    string PacienteNombre,
    int? PacienteEdad,
    string EspecialidadId,
    string InterconsultaId,
    DatosClinicosDto? DatosClinicos,
    VulnerabilidadDto Vulnerabilidad,
    PriorizacionDto? Priorizacion,
    AgendaDto? Agenda,
    IReadOnlyList<CasoEvento> Eventos,
    IReadOnlyList<AgentExecutionLog> EjecucionesAgentes,
    IReadOnlyList<DecisionLog> Decisiones);

/// <summary>Ultimo AntecedenteClinico del paciente — los mismos datos que usa el Risk Agent (ver
/// GetPatientClinicalDataTool), expuestos aqui para que el frontend los muestre sin re-derivarlos.</summary>
public record DatosClinicosDto(
    double HbA1c, double GlicemiaAyunas, IReadOnlyList<string> Comorbilidades, DateTime FechaRegistro,
    double? Vfg, double? MicroalbuminuriaRac, bool NeuropatiaPrevia, int UrgenciasUltimos90Dias,
    IReadOnlyList<string> AlertasClinicas);

public record VulnerabilidadDto(bool DependenciaSevera, bool Ruralidad, IReadOnlyList<string> DeterminantesSociales);

public record PriorizacionDto(
    int? RiskScore, string? RiskLevel, string? RiskJustificacion,
    int? PriorityScore, string? PriorityTier, string? PriorityJustificacion,
    string? TierConfirmado, string? ConfirmadaPor, string? OrigenConfirmacion);

public record AgendaDto(string AgendaSlotId, DateTime FechaHora, string ProfesionalId, string CentroSaludId);

public record ObtenerCasoQuery(string ListaEsperaItemId) : IRequest<CasoDetalleDto>;

public class ObtenerCasoQueryHandler(
    IListaEsperaRepository listaEsperaRepo,
    IPacienteRepository pacienteRepo,
    IPriorizacionRepository priorizacionRepo,
    IAgendaSlotRepository agendaRepo,
    ICasoEventoRepository eventoRepo,
    IAgentExecutionLogRepository agentLogRepo,
    IDecisionLogRepository decisionLogRepo) : IRequestHandler<ObtenerCasoQuery, CasoDetalleDto>
{
    // Mismo criterio que ListarListaEsperaQuery: el tier de prioridad solo es real una vez que el
    // caso avanzó a "Priorizado" o más allá (evita mostrar PriorityTier.P1, valor 0 del enum, como
    // si fuera una decisión real cuando el pipeline de agentes IA quedó a medio camino).
    private static readonly HashSet<EstadoCaso> EstadosConPriorizacionCompleta =
    [
        EstadoCaso.Priorizado, EstadoCaso.EnRevision, EstadoCaso.Agendado,
        EstadoCaso.Confirmado, EstadoCaso.Atendido, EstadoCaso.Cerrado
    ];

    public async Task<CasoDetalleDto> Handle(ObtenerCasoQuery request, CancellationToken cancellationToken)
    {
        var item = await listaEsperaRepo.GetByIdAsync(request.ListaEsperaItemId, cancellationToken)
            ?? throw new InvalidOperationException($"Caso {request.ListaEsperaItemId} no existe.");
        var paciente = await pacienteRepo.GetByIdAsync(item.PacienteId, cancellationToken);
        var priorizacion = await priorizacionRepo.GetByListaEsperaItemIdAsync(item.Id, cancellationToken);
        var agenda = await agendaRepo.GetByListaEsperaItemIdAsync(item.Id, cancellationToken);
        var eventos = await eventoRepo.GetByListaEsperaItemIdAsync(item.Id, cancellationToken);
        var agentLogs = await agentLogRepo.GetByListaEsperaItemIdAsync(item.Id, cancellationToken);
        var decisiones = await decisionLogRepo.GetByListaEsperaItemIdAsync(item.Id, cancellationToken);

        // RiskJustificacion no vacía es la señal de que el Risk Agent efectivamente corrió
        // (evita mostrar RiskScore=0/RiskLevel=Bajo por defecto si el pipeline falló antes de llegar ahí).
        var riskCalculado = priorizacion is not null && !string.IsNullOrEmpty(priorizacion.RiskJustificacion);
        var priorizacionCompleta = priorizacion is not null && EstadosConPriorizacionCompleta.Contains(item.Estado);

        var priorizacionDto = priorizacion is null ? null : new PriorizacionDto(
            riskCalculado ? priorizacion.RiskScore : null,
            riskCalculado ? priorizacion.RiskLevel.ToString() : null,
            riskCalculado ? priorizacion.RiskJustificacion : null,
            priorizacionCompleta ? priorizacion.PriorityScore : null,
            priorizacionCompleta ? priorizacion.PriorityTier.ToString() : null,
            priorizacionCompleta ? priorizacion.PriorityJustificacion : null,
            priorizacion.TierConfirmado?.ToString(), priorizacion.ConfirmadaPor, priorizacion.OrigenConfirmacion?.ToString());

        var agendaDto = agenda is null ? null : new AgendaDto(agenda.Id, agenda.FechaHora, agenda.ProfesionalId, agenda.CentroSaludId);

        var ultimoAntecedente = paciente?.UltimoAntecedente();
        var datosClinicosDto = ultimoAntecedente is null ? null : new DatosClinicosDto(
            ultimoAntecedente.HbA1c, ultimoAntecedente.GlicemiaAyunas, ultimoAntecedente.Comorbilidades,
            ultimoAntecedente.FechaRegistro, ultimoAntecedente.Vfg, ultimoAntecedente.MicroalbuminuriaRac,
            ultimoAntecedente.NeuropatiaPrevia, ultimoAntecedente.UrgenciasUltimos90Dias, ultimoAntecedente.AlertasClinicas);

        var vulnerabilidadDto = new VulnerabilidadDto(
            paciente?.DependenciaSevera ?? false, paciente?.Ruralidad ?? false, paciente?.DeterminantesSociales ?? []);

        return new CasoDetalleDto(
            item.Id,
            item.Estado.ToString(),
            item.DiasEnEspera(),
            item.PacienteId,
            paciente?.Nombre ?? "(desconocido)",
            paciente?.EdadEnAnios(),
            item.EspecialidadId,
            item.InterconsultaId,
            datosClinicosDto,
            vulnerabilidadDto,
            priorizacionDto,
            agendaDto,
            eventos.OrderBy(e => e.Timestamp).ToList(),
            agentLogs.OrderBy(l => l.Timestamp).ToList(),
            decisiones.OrderBy(d => d.Timestamp).ToList());
    }
}
