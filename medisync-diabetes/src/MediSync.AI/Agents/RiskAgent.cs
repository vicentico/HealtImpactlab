using MediSync.Application.Abstractions;
using MediSync.Domain.Priorizacion;

namespace MediSync.AI.Agents;

public class RiskAgent(AgentLoop loop, IPacienteRepository pacientes) : IRiskAgent
{
    private static readonly AgentManifest Manifest =
        AgentManifest.LoadFromFile(Path.Combine(AppContext.BaseDirectory, "Manifests", "risk-agent.json"));

    public async Task<RiskAssessment> EvaluarAsync(string pacienteId, string listaEsperaItemId, CancellationToken ct = default)
    {
        var paciente = await pacientes.GetByIdAsync(pacienteId, ct)
            ?? throw new InvalidOperationException($"Paciente {pacienteId} no existe.");

        var userMessage =
            $"Evalua el riesgo clinico del paciente con pacienteId={pacienteId} (caso listaEsperaItemId={listaEsperaItemId}). " +
            $"Nombre: {paciente.Nombre}, edad: {paciente.EdadEnAnios()} anios. " +
            "Usa las herramientas disponibles para obtener sus datos clinicos exactos antes de concluir.";

        var run = await loop.RunAsync(Manifest, userMessage, ct);
        var json = JsonResponseParser.ExtractJsonObject(run.RespuestaTexto);

        var riskScore = json["riskScore"]!.GetValue<int>();
        var riskLevel = Enum.Parse<RiskLevel>(json["riskLevel"]!.GetValue<string>(), ignoreCase: true);
        var justificacion = json["justificacion"]!.GetValue<string>();

        return new RiskAssessment(riskScore, riskLevel, justificacion, run);
    }
}
