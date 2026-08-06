using System.Text.Json.Nodes;
using MediSync.Application.Abstractions;

namespace MediSync.AI.Tools;

/// <summary>
/// Chequeo deterministico (no delegado a Claude) de los 4 criterios de derivacion urgente del dossier ECICEP:
/// sospecha IAM/ACV, crisis hiperglicemica con compromiso de conciencia, pie diabetico infectado activo, o
/// caida de VFG mayor a 30% entre las dos ultimas mediciones. Ver docs/08-analisis-ecicep-prompt.md, tarea 3.4.
/// </summary>
public class CheckEmergencyEscalationTool(IPacienteRepository pacientes) : IAgentTool
{
    private const double CaidaVfgCriticaFraccion = 0.30;

    public string Name => "check_emergency_escalation";
    public string Description =>
        "Verifica si el paciente cumple algun criterio de derivacion urgente, fuera del flujo normal de " +
        "priorizacion: sospecha de IAM/ACV, crisis hiperglicemica con compromiso de conciencia, pie diabetico " +
        "infectado activo, o caida de VFG mayor a 30% entre las dos ultimas mediciones. Llamar esta tool ANTES " +
        "de calcular el score de riesgo normal.";

    public JsonObject InputSchema => new()
    {
        ["type"] = "object",
        ["properties"] = new JsonObject
        {
            ["pacienteId"] = new JsonObject { ["type"] = "string", ["description"] = "Id del paciente" }
        },
        ["required"] = new JsonArray("pacienteId")
    };

    public async Task<string> ExecuteAsync(JsonObject input, CancellationToken ct = default)
    {
        var pacienteId = input["pacienteId"]?.GetValue<string>()
            ?? throw new ArgumentException("Falta 'pacienteId'.");
        var paciente = await pacientes.GetByIdAsync(pacienteId, ct);
        if (paciente is null)
        {
            return new JsonObject { ["error"] = $"Paciente {pacienteId} no encontrado." }.ToJsonString();
        }

        var ordenados = paciente.Antecedentes.OrderByDescending(a => a.FechaRegistro).ToList();
        var ultimo = ordenados.FirstOrDefault();
        var motivos = new List<string>();

        if (ultimo is not null && ultimo.AlertasClinicas.Count > 0)
        {
            motivos.AddRange(ultimo.AlertasClinicas);
        }

        if (ordenados.Count >= 2 && ordenados[0].Vfg is double vfgActual && ordenados[1].Vfg is double vfgPrevio && vfgPrevio > 0)
        {
            var caida = (vfgPrevio - vfgActual) / vfgPrevio;
            if (caida > CaidaVfgCriticaFraccion)
            {
                motivos.Add($"Caida de VFG de {caida:P0} entre mediciones ({vfgPrevio} -> {vfgActual} ml/min), sobre el umbral de 30%.");
            }
        }

        var alarma = motivos.Count > 0;
        return new JsonObject
        {
            ["alarma"] = alarma,
            ["motivo"] = alarma ? string.Join(" ", motivos) : null
        }.ToJsonString();
    }
}
