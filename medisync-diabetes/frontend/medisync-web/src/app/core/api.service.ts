import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CasoDetalleDto, ListaEsperaItemDto } from './models';

const API_BASE_URL = 'http://localhost:5182/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  listarListaEspera(): Promise<ListaEsperaItemDto[]> {
    return firstValueFrom(this.http.get<ListaEsperaItemDto[]>(`${API_BASE_URL}/lista-espera`));
  }

  obtenerCaso(id: string): Promise<CasoDetalleDto> {
    return firstValueFrom(this.http.get<CasoDetalleDto>(`${API_BASE_URL}/casos/${id}`));
  }

  registrarPaciente(body: { run: string; nombre: string; fechaNacimiento: string; cesfamOrigenId: string }): Promise<{ pacienteId: string }> {
    return firstValueFrom(this.http.post<{ pacienteId: string }>(`${API_BASE_URL}/pacientes`, body));
  }

  registrarInterconsulta(body: {
    pacienteId: string; especialidadId: string; motivo: string;
    hbA1c: number; glicemiaAyunas: number; comorbilidades: string[];
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
