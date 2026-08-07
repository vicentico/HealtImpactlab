using MediSync.Application.Abstractions;
using MediSync.Domain.Priorizacion;

namespace MediSync.AI.Agents;

public class MinsalPriorityAgent(AgentLoop loop) : IMinsalPriorityAgent
{
    private static readonly AgentManifest Manifest =
        AgentManifest.LoadFromFile(Path.Combine(AppContext.BaseDirectory, "Manifests", "minsal-priority-agent.json"));

    public async Task<MinsalAssessment> CalcularAsync(string pacienteId, string listaEsperaItemId, CancellationToken ct = default)
    {
        var userMessage =
            $"Calcula la prioridad segun el Protocolo Algoritmico MINSAL para el paciente pacienteId={pacienteId} " +
            $"(caso listaEsperaItemId={listaEsperaItemId}). Usa calcular_puntaje_minsal para obtener el desglose exacto.";

        var run = await loop.RunAsync(Manifest, userMessage, ct);
        var json = JsonResponseParser.ExtractJsonObject(run.RespuestaTexto);

        var puntajeTotal = json["puntajeTotal"]!.GetValue<int>();
        var prioridadMinsal = Enum.Parse<PrioridadMinsal>(json["prioridadMinsal"]!.GetValue<string>(), ignoreCase: true);
        var estratoRiesgo = Enum.Parse<EstratoRiesgo>(json["estratoRiesgo"]!.GetValue<string>(), ignoreCase: true);
        var justificacion = json["justificacion"]!.GetValue<string>();

        return new MinsalAssessment(puntajeTotal, prioridadMinsal, estratoRiesgo, justificacion, run);
    }
}
