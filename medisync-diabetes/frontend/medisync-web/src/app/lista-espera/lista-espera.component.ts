import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../core/api.service';
import { ListaEsperaItemDto } from '../core/models';

@Component({
  selector: 'app-lista-espera',
  imports: [RouterLink, MatTableModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatTooltipModule],
  templateUrl: './lista-espera.component.html',
  styleUrl: './lista-espera.component.css'
})
export class ListaEsperaComponent {
  private readonly api = inject(ApiService);

  readonly displayedColumns = ['paciente', 'especialidad', 'estado', 'diasEnEspera', 'prioridad', 'acciones'];
  readonly casos = signal<ListaEsperaItemDto[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.cargar();
  }

  async cargar(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const casos = await this.api.listarListaEspera();
      this.casos.set(casos);
    } catch (err) {
      this.error.set('No se pudo cargar la lista de espera. ¿Está corriendo MediSync.Api en http://localhost:5182?');
    } finally {
      this.loading.set(false);
    }
  }

  tierPillClass(tier: string | null): string {
    if (tier === 'P1') return 'status-pill status-pill--critical';
    if (tier === 'P2') return 'status-pill status-pill--warning';
    if (tier === 'P3') return 'status-pill status-pill--good';
    return 'status-pill status-pill--neutral';
  }
}
