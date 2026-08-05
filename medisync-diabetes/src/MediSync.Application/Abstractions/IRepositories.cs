using MediSync.Domain.Agenda;
using MediSync.Domain.Auditoria;
using MediSync.Domain.Catalogos;
using MediSync.Domain.Interconsultas;
using MediSync.Domain.ListaEspera;
using MediSync.Domain.Pacientes;
using PriorizacionEntity = MediSync.Domain.Priorizacion.Priorizacion;

namespace MediSync.Application.Abstractions;

public interface IPacienteRepository
{
    Task<Paciente?> GetByIdAsync(string id, CancellationToken ct = default);
    Task AddAsync(Paciente paciente, CancellationToken ct = default);
    Task UpdateAsync(Paciente paciente, CancellationToken ct = default);
}

public interface IInterconsultaRepository
{
    Task<Interconsulta?> GetByIdAsync(string id, CancellationToken ct = default);
    Task AddAsync(Interconsulta interconsulta, CancellationToken ct = default);
    Task UpdateAsync(Interconsulta interconsulta, CancellationToken ct = default);
}

public interface IListaEsperaRepository
{
    Task<ListaEsperaItem?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<IReadOnlyList<ListaEsperaItem>> GetAllAsync(CancellationToken ct = default);
    Task<int> CountEnEsperaPorEspecialidadAsync(string especialidadId, CancellationToken ct = default);
    Task AddAsync(ListaEsperaItem item, CancellationToken ct = default);
    Task UpdateAsync(ListaEsperaItem item, CancellationToken ct = default);
}

public interface IPriorizacionRepository
{
    Task<PriorizacionEntity?> GetByListaEsperaItemIdAsync(string listaEsperaItemId, CancellationToken ct = default);
    Task AddAsync(PriorizacionEntity priorizacion, CancellationToken ct = default);
    Task UpdateAsync(PriorizacionEntity priorizacion, CancellationToken ct = default);
}

public interface IAgendaSlotRepository
{
    Task<AgendaSlot?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<IReadOnlyList<AgendaSlot>> GetDisponiblesPorEspecialidadAsync(string especialidadId, CancellationToken ct = default);
    Task<AgendaSlot?> GetByListaEsperaItemIdAsync(string listaEsperaItemId, CancellationToken ct = default);
    Task AddAsync(AgendaSlot slot, CancellationToken ct = default);
    Task UpdateAsync(AgendaSlot slot, CancellationToken ct = default);
}

public interface ICasoEventoRepository
{
    Task<IReadOnlyList<CasoEvento>> GetByListaEsperaItemIdAsync(string listaEsperaItemId, CancellationToken ct = default);
    Task AddAsync(CasoEvento evento, CancellationToken ct = default);
}

public interface IAgentExecutionLogRepository
{
    Task<IReadOnlyList<AgentExecutionLog>> GetByListaEsperaItemIdAsync(string listaEsperaItemId, CancellationToken ct = default);
    Task AddAsync(AgentExecutionLog log, CancellationToken ct = default);
}

public interface IDecisionLogRepository
{
    Task<IReadOnlyList<DecisionLog>> GetByListaEsperaItemIdAsync(string listaEsperaItemId, CancellationToken ct = default);
    Task AddAsync(DecisionLog log, CancellationToken ct = default);
}

public interface IEspecialidadRepository
{
    Task<Especialidad?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<IReadOnlyList<Especialidad>> GetAllAsync(CancellationToken ct = default);
}

public interface ICentroSaludRepository
{
    Task<CentroSalud?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<IReadOnlyList<CentroSalud>> GetAllAsync(CancellationToken ct = default);
}

public interface IProfesionalRepository
{
    Task<Profesional?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<IReadOnlyList<Profesional>> GetByEspecialidadAsync(string especialidadId, CancellationToken ct = default);
}
