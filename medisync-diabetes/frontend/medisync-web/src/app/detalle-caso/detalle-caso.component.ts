import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { CasoDetalleDto } from '../core/models';

@Component({
  selector: 'app-detalle-caso',
  imports: [FormsModule, RouterLink, DatePipe],
  templateUrl: './detalle-caso.component.html',
  styleUrl: './detalle-caso.component.css'
})
export class DetalleCasoComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);

  readonly caso = signal<CasoDetalleDto | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly actionInProgress = signal(false);

  aprobadoPor = '';
  prioridadConfirmada = 'P1';

  private readonly id: string;

  constructor() {
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.cargar();
  }

  async cargar(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const caso = await this.api.obtenerCaso(this.id);
      this.caso.set(caso);
      if (caso.priorizacion?.priorityTier) {
        this.prioridadConfirmada = caso.priorizacion.priorityTier;
      }
    } catch {
      this.error.set('No se pudo cargar el caso.');
    } finally {
      this.loading.set(false);
    }
  }

  async revisar(): Promise<void> {
    await this.ejecutar(() => this.api.revisarCaso(this.id, {
      aprobadoPor: this.aprobadoPor,
      prioridadConfirmada: this.prioridadConfirmada
    }));
  }

  async confirmar(): Promise<void> {
    await this.ejecutar(() => this.api.confirmarAgenda(this.id));
  }

  async atender(): Promise<void> {
    await this.ejecutar(() => this.api.registrarAtencion(this.id));
  }

  async cerrar(): Promise<void> {
    await this.ejecutar(() => this.api.cerrarCaso(this.id));
  }

  private async ejecutar(accion: () => Promise<void>): Promise<void> {
    this.actionInProgress.set(true);
    this.error.set(null);
    try {
      await accion();
      await this.cargar();
    } catch {
      this.error.set('La accion no se pudo completar. Revisa el estado actual del caso.');
    } finally {
      this.actionInProgress.set(false);
    }
  }
}
