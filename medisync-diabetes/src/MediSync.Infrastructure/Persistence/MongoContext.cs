using MediSync.Infrastructure.Persistence.Documents;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace MediSync.Infrastructure.Persistence;

public class MongoContext
{
    public IMongoDatabase Database { get; }

    public IMongoCollection<PacienteDocument> Pacientes => Database.GetCollection<PacienteDocument>("pacientes");
    public IMongoCollection<InterconsultaDocument> Interconsultas => Database.GetCollection<InterconsultaDocument>("interconsultas");
    public IMongoCollection<ListaEsperaItemDocument> ListaEsperaItems => Database.GetCollection<ListaEsperaItemDocument>("lista_espera_items");
    public IMongoCollection<PriorizacionDocument> Priorizaciones => Database.GetCollection<PriorizacionDocument>("priorizaciones");
    public IMongoCollection<AgendaSlotDocument> AgendaSlots => Database.GetCollection<AgendaSlotDocument>("agenda_slots");
    public IMongoCollection<CasoEventoDocument> CasoEventos => Database.GetCollection<CasoEventoDocument>("caso_eventos");
    public IMongoCollection<AgentExecutionLogDocument> AgentExecutionLogs => Database.GetCollection<AgentExecutionLogDocument>("agent_execution_logs");
    public IMongoCollection<DecisionLogDocument> DecisionLogs => Database.GetCollection<DecisionLogDocument>("decision_logs");
    public IMongoCollection<EspecialidadDocument> Especialidades => Database.GetCollection<EspecialidadDocument>("especialidades");
    public IMongoCollection<CentroSaludDocument> CentrosSalud => Database.GetCollection<CentroSaludDocument>("centros_salud");
    public IMongoCollection<ProfesionalDocument> Profesionales => Database.GetCollection<ProfesionalDocument>("profesionales");

    public MongoContext(IOptions<MongoOptions> options)
    {
        MongoConventions.RegisterOnce();
        var client = new MongoClient(options.Value.ConnectionString);
        Database = client.GetDatabase(options.Value.Database);
    }
}
