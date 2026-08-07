export interface ListaEsperaItemDto {
  listaEsperaItemId: string;
  pacienteId: string;
  pacienteNombre: string;
  especialidadId: string;
  estado: string;
  diasEnEspera: number;
  priorityTier: string | null;
  priorityScore: number | null;
  requiereDerivacionUrgente: boolean;
}

export interface PriorizacionDto {
  riskScore: number | null;
  riskLevel: string | null;
  riskJustificacion: string | null;
  priorityScore: number | null;
  priorityTier: string | null;
  priorityJustificacion: string | null;
  tierConfirmado: string | null;
  confirmadaPor: string | null;
  origenConfirmacion: string | null;
  puntajeMinsal: number | null;
  prioridadMinsal: string | null;
  estratoRiesgo: string | null;
  minsalJustificacion: string | null;
}

export interface AgendaDto {
  agendaSlotId: string;
  fechaHora: string;
  profesionalId: string;
  centroSaludId: string;
}

export interface CasoEventoDto {
  id: string;
  listaEsperaItemId: string;
  tipoEvento: string;
  descripcion: string;
  timestamp: string;
}

export interface ToolCallRecordDto {
  toolName: string;
  inputJson: string;
  outputJson: string;
}

export interface AgentExecutionLogDto {
  id: string;
  agenteNombre: string;
  input: string;
  output: string;
  toolCalls: ToolCallRecordDto[];
  iteraciones: number;
  tokensEntrada: number;
  tokensSalida: number;
  correlationId: string;
  timestamp: string;
}

export interface DecisionLogDto {
  id: string;
  decision: string;
  justificacion: string;
  origen: string;
  autor: string;
  timestamp: string;
}

export interface KpisDto {
  totalCasosActivos: number;
  totalCasosCerrados: number;
  casosDerivacionUrgente: number;
  diasEnEsperaPromedio: number;
  diasEnEsperaMaximo: number;
  distribucionPorEstado: Record<string, number>;
  distribucionPorPriorityTier: Record<string, number>;
  notificacionesEnviadas: number;
  notificacionesSinRespuesta: number;
  tasaNsp: number;
}

export interface DatosClinicosDto {
  hbA1c: number;
  glicemiaAyunas: number;
  comorbilidades: string[];
  fechaRegistro: string;
  vfg: number | null;
  microalbuminuriaRac: number | null;
  neuropatiaPrevia: boolean;
  urgenciasUltimos90Dias: number;
  alertasClinicas: string[];
}

export interface VulnerabilidadDto {
  dependenciaSevera: boolean;
  ruralidad: boolean;
  determinantesSociales: string[];
}

export interface PacienteResumenDto {
  pacienteId: string;
  nombre: string;
  run: string;
  edad: number;
  cesfamOrigenId: string;
}

export interface AntecedenteHistorialDto {
  hbA1c: number;
  glicemiaAyunas: number;
  comorbilidades: string[];
  fechaRegistro: string;
  vfg: number | null;
  microalbuminuriaRac: number | null;
  neuropatiaPrevia: boolean;
  urgenciasUltimos90Dias: number;
  alertasClinicas: string[];
  numeroFarmacosActivos: number;
}

export interface AtencionUrgenciaDto {
  fecha: string;
  motivo: string;
}

export interface HospitalizacionDto {
  fechaIngreso: string;
  fechaAlta: string | null;
  motivo: string;
}

export interface PacienteDetalleDto {
  pacienteId: string;
  nombre: string;
  run: string;
  fechaNacimiento: string;
  edad: number;
  cesfamOrigenId: string;
  dependenciaSevera: boolean;
  ruralidad: boolean;
  determinantesSociales: string[];
  nivelRedApoyo: string | null;
  antecedentes: AntecedenteHistorialDto[];
  atencionesUrgencia: AtencionUrgenciaDto[];
  hospitalizaciones: HospitalizacionDto[];
}

export interface MatrizRiesgoDto {
  celdas: Record<string, Record<string, number>>;
}

export interface ReprocesarPendientesDto {
  pendientesEncontrados: number;
  procesadosOk: number;
  derivadosUrgente: number;
  fallidos: number;
}

export interface CasoDetalleDto {
  listaEsperaItemId: string;
  estado: string;
  diasEnEspera: number;
  pacienteId: string;
  pacienteNombre: string;
  pacienteEdad: number | null;
  especialidadId: string;
  interconsultaId: string;
  datosClinicos: DatosClinicosDto | null;
  vulnerabilidad: VulnerabilidadDto;
  priorizacion: PriorizacionDto | null;
  agenda: AgendaDto | null;
  eventos: CasoEventoDto[];
  ejecucionesAgentes: AgentExecutionLogDto[];
  decisiones: DecisionLogDto[];
}
