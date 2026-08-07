using System.Text.Json.Nodes;
using MediSync.Application.Abstractions;
using MediSync.Domain.Pacientes;
using MediSync.Domain.Priorizacion;

namespace MediSync.AI.Tools;

/// <summary>
/// Calcula el Protocolo Algoritmico de Priorizacion MINSAL (C1-C5, ver
/// docs/ECICEP_MODELO_TECNICO_OPERATIVO.md seccion 5) y el Estrato de Riesgo G1-G3 (seccion 3),
/// deterministico — no delega en Claude, porque ambas son tablas de puntos fijas sin ambiguedad
/// clinica que requiera el juicio de un LLM. Ver docs/11-protocolo-minsal-prompt.md.
/// </summary>
public class CalcularPuntajeMinsalTool(IPacienteRepository pacientes) : IAgentTool
{
    public string Name => "calcular_puntaje_minsal";
    public string Description =>
        "Calcula el puntaje C1-C5 del Protocolo Algoritmico MINSAL (Control Metabolico, ERC, Uso de " +
        "Urgencia, Riesgo Social, Polifarmacia), la prioridad Alta/Media/Baja con su SLA en dias, y el " +
        "Estrato de Riesgo G1-G3, a partir de los datos clinicos y el historial del paciente.";

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

        var ultimo = paciente.UltimoAntecedente();
        var ahora = DateTime.UtcNow;

        var c1 = CalcularC1(ultimo?.HbA1c);
        var c2 = CalcularC2(ultimo?.Vfg, ultimo?.MicroalbuminuriaRac);
        var c3 = CalcularC3(paciente, ahora);
        var c4 = CalcularC4(paciente.NivelRedApoyo);
        var c5 = CalcularC5(ultimo?.NumeroFarmacosActivos ?? 0);
        var puntajeTotal = c1 + c2 + c3 + c4 + c5;

        var (prioridad, sla) = puntajeTotal switch
        {
            >= 10 => (PrioridadMinsal.Alta, "7-14"),
            >= 5 => (PrioridadMinsal.Media, "30"),
            _ => (PrioridadMinsal.Baja, "regular")
        };

        var estrato = CalcularEstrato(paciente, ultimo, c1, c2, c5);

        return new JsonObject
        {
            ["c1HbA1c"] = c1,
            ["c2Erc"] = c2,
            ["c3Urgencia"] = c3,
            ["c4RiesgoSocial"] = c4,
            ["c5Polifarmacia"] = c5,
            ["puntajeTotal"] = puntajeTotal,
            ["prioridadMinsal"] = prioridad.ToString(),
            ["slaDias"] = sla,
            ["estratoRiesgo"] = estrato.ToString()
        }.ToJsonString();
    }

    // C1 — Control Metabolico: <7.0%=0, 7.0-8.9%=2, >=9.0%=4
    private static int CalcularC1(double? hbA1c)
    {
        if (hbA1c is null) return 0;
        if (hbA1c >= 9.0) return 4;
        if (hbA1c >= 7.0) return 2;
        return 0;
    }

    // C2 — Complicacion Renal: toma el peor entre RAC (<30=0, 30-299=1, >=300=3) y VFG (>=60=0, 45-59=1, <45=3)
    private static int CalcularC2(double? vfg, double? rac)
    {
        var puntajeRac = rac switch { null => 0, >= 300 => 3, >= 30 => 1, _ => 0 };
        var puntajeVfg = vfg switch { null => 0, < 45 => 3, < 60 => 1, _ => 0 };
        return Math.Max(puntajeRac, puntajeVfg);
    }

    // C3 — Uso de Urgencia: 0 sin atenciones; 2 si 1 en el ultimo mes; 4 si >=2 en 6 meses u hospitalizacion
    private static int CalcularC3(Paciente paciente, DateTime ahora)
    {
        var urgenciasUltimoMes = paciente.ContarAtencionesUrgenciaDesde(ahora.AddDays(-30));
        var urgenciasUltimos6Meses = paciente.ContarAtencionesUrgenciaDesde(ahora.AddDays(-180));
        var hospitalizacionesUltimos6Meses = paciente.ContarHospitalizacionesDesde(ahora.AddDays(-180));

        if (urgenciasUltimos6Meses >= 2 || hospitalizacionesUltimos6Meses >= 1) return 4;
        if (urgenciasUltimoMes >= 1) return 2;
        return 0;
    }

    // C4 — Riesgo Social/Redes: red efectiva=0, red parcial=1, sin red/abandono/cuidador colapsado=3
    private static int CalcularC4(NivelRedApoyo? nivel) => nivel switch
    {
        NivelRedApoyo.SinRedOAbandono => 3,
        NivelRedApoyo.RedParcial => 1,
        _ => 0
    };

    // C5 — Polifarmacia: <5=0, 5-6=1, >=7=2
    private static int CalcularC5(int numeroFarmacos)
    {
        if (numeroFarmacos >= 7) return 2;
        if (numeroFarmacos >= 5) return 1;
        return 0;
    }

    // Estrato G1-G3 (seccion 3 del documento): toma el nivel mas alto alcanzado por cualquiera de las
    // dimensiones (numero de condiciones cronicas + farmacos, control metabolico, daño de organo blanco,
    // fragilidad/redes) — mismo criterio "el peor gana" que ya usa C2. Aproximacion honesta: el
    // documento tambien pide un test funcional especifico (Get Up and Go) que no existe como campo hoy;
    // se aproxima con DependenciaSevera/NivelRedApoyo (ver docs/11-protocolo-minsal-prompt.md, 4.1).
    private static EstratoRiesgo CalcularEstrato(Paciente paciente, AntecedenteClinico? ultimo, int c1, int c2, int c5)
    {
        var numeroCondicionesCronicas = ultimo?.Comorbilidades.Count ?? 0;
        var alertaOrganoBlanco = ultimo?.AlertasClinicas.Count > 0;
        var fragil = paciente.DependenciaSevera || paciente.NivelRedApoyo == NivelRedApoyo.SinRedOAbandono;

        var esG3 = numeroCondicionesCronicas >= 5 || c5 >= 2 || c1 >= 4 || c2 >= 3 || fragil || alertaOrganoBlanco;
        if (esG3) return EstratoRiesgo.G3;

        var esG2 = numeroCondicionesCronicas >= 2 || c5 >= 1 || c1 >= 2 || c2 >= 1 ||
                   paciente.NivelRedApoyo == NivelRedApoyo.RedParcial;
        return esG2 ? EstratoRiesgo.G2 : EstratoRiesgo.G1;
    }
}
