using MediSync.Application.Abstractions;

namespace MediSync.AI.Agents;

public class SchedulerAgent(
    AgentLoop loop,
    IListaEsperaRepository listaEsperaRepo,
    IPriorizacionRepository priorizacionRepo,
    IAgendaSlotRepository agendaSlots) : ISchedulerAgent
{
    private static readonly AgentManifest Manifest =
        AgentManifest.LoadFromFile(Path.Combine(AppContext.BaseDirectory, "Manifests", "scheduler-agent.json"));

    public async Task<SchedulerAssignment> AsignarAsync(string listaEsperaItemId, CancellationToken ct = default)
    {
        var item = await listaEsperaRepo.GetByIdAsync(listaEsperaItemId, ct)
            ?? throw new InvalidOperationException($"Caso {listaEsperaItemId} no existe.");
        var priorizacion = await priorizacionRepo.GetByListaEsperaItemIdAsync(listaEsperaItemId, ct)
            ?? throw new InvalidOperationException($"El caso {listaEsperaItemId} aun no tiene priorizacion.");

        var tier = priorizacion.TierConfirmado ?? priorizacion.PriorityTier;

        var userMessage =
            $"Asigna un cupo de agenda para el caso listaEsperaItemId={item.Id}, especialidadId={item.EspecialidadId}, " +
            $"tier de prioridad confirmado={tier}. Usa las herramientas para ver cupos disponibles, reservar el mas " +
            $"adecuado (parametro listaEsperaItemId={item.Id}) y notificar al paciente del canal simulado.";

        var run = await loop.RunAsync(Manifest, userMessage, ct);
        var json = JsonResponseParser.ExtractJsonObject(run.RespuestaTexto);

        var slotId = json["agendaSlotId"]!.GetValue<string>();
        var justificacion = json["justificacion"]!.GetValue<string>();

        var slot = await agendaSlots.GetByIdAsync(slotId, ct)
            ?? throw new InvalidOperationException($"El Scheduler Agent reservo el cupo {slotId}, pero no se encontró en el repositorio.");

        return new SchedulerAssignment(slot.Id, slot.FechaHora, slot.ProfesionalId, slot.CentroSaludId, justificacion, run);
    }
}
