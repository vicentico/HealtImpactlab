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

export interface CasoDetalleDto {
  listaEsperaItemId: string;
  estado: string;
  diasEnEspera: number;
  pacienteId: string;
  pacienteNombre: string;
  especialidadId: string;
  interconsultaId: string;
  priorizacion: PriorizacionDto | null;
  agenda: AgendaDto | null;
  eventos: CasoEventoDto[];
  ejecucionesAgentes: AgentExecutionLogDto[];
  decisiones: DecisionLogDto[];
}
