using MediSync.Application.Abstractions;
using MediSync.Domain.Priorizacion;

namespace MediSync.AI.Agents;

public class PriorityAgent(AgentLoop loop, IListaEsperaRepository listaEsperaRepo) : IPriorityAgent
{
    private static readonly AgentManifest Manifest =
        AgentManifest.LoadFromFile(Path.Combine(AppContext.BaseDirectory, "Manifests", "priority-agent.json"));

    public async Task<PriorityAssessment> CalcularAsync(string listaEsperaItemId, CancellationToken ct = default)
    {
        var item = await listaEsperaRepo.GetByIdAsync(listaEsperaItemId, ct)
            ?? throw new InvalidOperationException($"Caso {listaEsperaItemId} no existe.");

        var userMessage =
            $"Calcula la prioridad final para el caso listaEsperaItemId={item.Id}, especialidadId={item.EspecialidadId}. " +
            $"Dias en espera acumulados: {item.DiasEnEspera()}. " +
            "Usa las herramientas para obtener el riesgo ya calculado y la carga de la especialidad antes de decidir, " +
            "y registra tu decision final con record_decision_log (usa listaEsperaItemId=" + item.Id + ").";

        var run = await loop.RunAsync(Manifest, userMessage, ct);
        var json = JsonResponseParser.ExtractJsonObject(run.RespuestaTexto);

        var score = json["priorityScore"]!.GetValue<int>();
        var tier = Enum.Parse<PriorityTier>(json["priorityTier"]!.GetValue<string>(), ignoreCase: true);
        var justificacion = json["justificacion"]!.GetValue<string>();

        return new PriorityAssessment(score, tier, justificacion, run);
    }
}
