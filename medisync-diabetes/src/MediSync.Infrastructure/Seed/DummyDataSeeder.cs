using System.Text.Json;
using MediSync.Domain.Agenda;
using MediSync.Domain.Catalogos;
using MediSync.Domain.Pacientes;
using MediSync.Infrastructure.Persistence;
using MediSync.Infrastructure.Persistence.Documents;
using MediSync.Infrastructure.Persistence.Indexes;
using MongoDB.Driver;

namespace MediSync.Infrastructure.Seed;

/// <summary>
/// Siembra datos dummy mínimos para poder ejercitar el flujo completo de la PoC sin depender
/// de integraciones reales (FONASA, agenda real, etc.). Es idempotente: solo siembra si las
/// colecciones de referencia están vacías.
/// </summary>
public class DummyDataSeeder(MongoContext context)
{
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    public async Task SeedAsync(string dummyDataPath, CancellationToken ct = default)
    {
        await MongoIndexInitializer.EnsureIndexesAsync(context, ct);

        if (await context.Especialidades.CountDocumentsAsync(FilterDefinition<EspecialidadDocument>.Empty, cancellationToken: ct) > 0)
        {
            return; // ya sembrado
        }

        var especialidades = ReadJson<EspecialidadSeed>(dummyDataPath, "especialidades.json")
            .Select(e => new Especialidad(e.Id, e.Nombre).ToDocument());
        await context.Especialidades.InsertManyAsync(especialidades, cancellationToken: ct);

        var centros = ReadJson<CentroSaludSeed>(dummyDataPath, "cesfam-hospitales.json")
            .Select(c => new CentroSalud(c.Id, c.Nombre, Enum.Parse<TipoCentroSalud>(c.Tipo)).ToDocument())
            .ToList();
        await context.CentrosSalud.InsertManyAsync(centros, cancellationToken: ct);

        var profesionales = ReadJson<ProfesionalSeed>(dummyDataPath, "profesionales.json")
            .Select(p => new Profesional(p.Id, p.Nombre, p.EspecialidadId, p.CentroSaludId))
            .ToList();
        await context.Profesionales.InsertManyAsync(profesionales.Select(p => p.ToDocument()), cancellationToken: ct);

        var pacientes = ReadJson<PacienteSeed>(dummyDataPath, "pacientes.json")
            .Select(p => new Paciente(
                p.Run, p.Nombre, DateTime.Parse(p.FechaNacimiento), p.CesfamOrigenId,
                p.DependenciaSevera, p.Ruralidad, p.DeterminantesSociales))
            .ToList();
        await context.Pacientes.InsertManyAsync(pacientes.Select(p => p.ToDocument()), cancellationToken: ct);

        var slots = new List<AgendaSlot>();
        var diabetologiaProfesionales = profesionales.Where(p => p.EspecialidadId == "diabetologia").ToList();
        var baseDate = DateTime.UtcNow.Date.AddDays(1);
        for (var dia = 0; dia < 20; dia++)
        {
            foreach (var profesional in diabetologiaProfesionales)
            {
                slots.Add(new AgendaSlot(profesional.Id, profesional.CentroSaludId, "diabetologia", baseDate.AddDays(dia).AddHours(9)));
            }
        }
        await context.AgendaSlots.InsertManyAsync(slots.Select(s => s.ToDocument()), cancellationToken: ct);
    }

    private static List<T> ReadJson<T>(string basePath, string fileName)
    {
        var fullPath = Path.Combine(basePath, fileName);
        var json = File.ReadAllText(fullPath);
        return JsonSerializer.Deserialize<List<T>>(json, JsonOptions) ?? [];
    }

    private record EspecialidadSeed(string Id, string Nombre);
    private record CentroSaludSeed(string Id, string Nombre, string Tipo);
    private record ProfesionalSeed(string Id, string Nombre, string EspecialidadId, string CentroSaludId);
    private record PacienteSeed(
        string Run, string Nombre, string FechaNacimiento, string CesfamOrigenId,
        bool DependenciaSevera = false, bool Ruralidad = false, List<string>? DeterminantesSociales = null);
}
