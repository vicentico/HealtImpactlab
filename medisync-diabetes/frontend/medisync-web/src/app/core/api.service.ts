import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  CasoDetalleDto, KpisDto, ListaEsperaItemDto, MatrizRiesgoDto,
  PacienteDetalleDto, PacienteResumenDto, ReprocesarPendientesDto
} from './models';

const API_BASE_URL = 'http://localhost:5182/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  listarListaEspera(): Promise<ListaEsperaItemDto[]> {
    return firstValueFrom(this.http.get<ListaEsperaItemDto[]>(`${API_BASE_URL}/lista-espera`));
  }

  reprocesarPendientes(): Promise<ReprocesarPendientesDto> {
    return firstValueFrom(this.http.post<ReprocesarPendientesDto>(`${API_BASE_URL}/lista-espera/reprocesar`, {}));
  }

  obtenerKpis(): Promise<KpisDto> {
    return firstValueFrom(this.http.get<KpisDto>(`${API_BASE_URL}/kpis`));
  }

  obtenerMatrizRiesgo(): Promise<MatrizRiesgoDto> {
    return firstValueFrom(this.http.get<MatrizRiesgoDto>(`${API_BASE_URL}/matriz-riesgo`));
  }

  obtenerCaso(id: string): Promise<CasoDetalleDto> {
    return firstValueFrom(this.http.get<CasoDetalleDto>(`${API_BASE_URL}/casos/${id}`));
  }

  listarPacientes(texto?: string): Promise<PacienteResumenDto[]> {
    const query = texto ? `?q=${encodeURIComponent(texto)}` : '';
    return firstValueFrom(this.http.get<PacienteResumenDto[]>(`${API_BASE_URL}/pacientes${query}`));
  }

  obtenerPaciente(id: string): Promise<PacienteDetalleDto> {
    return firstValueFrom(this.http.get<PacienteDetalleDto>(`${API_BASE_URL}/pacientes/${id}`));
  }

  registrarPaciente(body: {
    run: string; nombre: string; fechaNacimiento: string; cesfamOrigenId: string;
    dependenciaSevera?: boolean; ruralidad?: boolean; determinantesSociales?: string[];
    nivelRedApoyo?: string | null;
  }): Promise<{ pacienteId: string }> {
    return firstValueFrom(this.http.post<{ pacienteId: string }>(`${API_BASE_URL}/pacientes`, body));
  }

  registrarInterconsulta(body: {
    pacienteId: string; especialidadId: string; motivo: string;
    hbA1c: number; glicemiaAyunas: number; comorbilidades: string[];
    vfg?: number | null; microalbuminuriaRac?: number | null; neuropatiaPrevia?: boolean;
    urgenciasUltimos90Dias?: number; alertasClinicas?: string[];
    numeroFarmacosActivos?: number;
    nuevasAtencionesUrgencia?: string[];
    nuevasHospitalizaciones?: { fechaIngreso: string; fechaAlta?: string | null; motivo: string }[];
  }): Promise<{ listaEsperaItemId: string }> {
    return firstValueFrom(this.http.post<{ listaEsperaItemId: string }>(`${API_BASE_URL}/interconsultas`, body));
  }

  revisarCaso(id: string, body: { aprobadoPor: string; prioridadConfirmada: string }): Promise<void> {
    return firstValueFrom(this.http.patch<void>(`${API_BASE_URL}/casos/${id}/revision`, body));
  }

  confirmarAgenda(id: string): Promise<void> {
    return firstValueFrom(this.http.post<void>(`${API_BASE_URL}/casos/${id}/confirmar`, {}));
  }

  registrarAtencion(id: string): Promise<void> {
    return firstValueFrom(this.http.post<void>(`${API_BASE_URL}/casos/${id}/atender`, {}));
  }

  cerrarCaso(id: string): Promise<void> {
    return firstValueFrom(this.http.post<void>(`${API_BASE_URL}/casos/${id}/cerrar`, {}));
  }
}
