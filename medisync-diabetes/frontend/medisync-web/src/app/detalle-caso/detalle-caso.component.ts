import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../core/api.service';
import { CasoDetalleDto } from '../core/models';

@Component({
  selector: 'app-detalle-caso',
  imports: [
    FormsModule, RouterLink, DatePipe, MatCardModule, MatChipsModule, MatIconModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatExpansionModule, MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './detalle-caso.component.html',
  styleUrl: './detalle-caso.component.css'
})
export class DetalleCasoComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly caso = signal<CasoDetalleDto | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly actionInProgress = signal(false);

  readonly derivacionUrgente = computed(() =>
    this.caso()?.eventos.some(e => e.tipoEvento === 'DerivacionUrgente') ?? false);

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
    try {
      await accion();
      await this.cargar();
    } catch {
      this.snackBar.open('La accion no se pudo completar. Revisa el estado actual del caso.', 'Cerrar');
    } finally {
      this.actionInProgress.set(false);
    }
  }

  pillClass(nivel: string | null): string {
    switch (nivel) {
      case 'P1': case 'Critico': return 'status-pill status-pill--critical';
      case 'P2': case 'Alto': return 'status-pill status-pill--warning';
      case 'P3': case 'Bajo': case 'Medio': return 'status-pill status-pill--good';
      default: return 'status-pill status-pill--neutral';
    }
  }
}
