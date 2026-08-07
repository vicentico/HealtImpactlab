import { Component, computed, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../core/api.service';
import { MatrizRiesgoDto } from '../core/models';

const ESTRATOS = ['G3', 'G2', 'G1'] as const;
const TIERS = ['P1', 'P2', 'P3'] as const;

@Component({
  selector: 'app-matriz-riesgo',
  imports: [MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, MatTooltipModule],
  templateUrl: './matriz-riesgo.component.html',
  styleUrl: './matriz-riesgo.component.css'
})
export class MatrizRiesgoComponent {
  private readonly api = inject(ApiService);

  readonly estratos = ESTRATOS;
  readonly tiers = TIERS;
  readonly matriz = signal<MatrizRiesgoDto | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly total = computed(() => {
    const m = this.matriz();
    if (!m) return 0;
    return this.estratos.reduce(
      (sum, e) => sum + this.tiers.reduce((s2, t) => s2 + (m.celdas[e]?.[t] ?? 0), 0), 0);
  });

  constructor() {
    this.cargar();
  }

  async cargar(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.matriz.set(await this.api.obtenerMatrizRiesgo());
    } catch {
      this.error.set('No se pudo cargar la matriz de riesgo.');
    } finally {
      this.loading.set(false);
    }
  }

  count(estrato: string, tier: string): number {
    return this.matriz()?.celdas[estrato]?.[tier] ?? 0;
  }

  // G3 (alto riesgo clinico MINSAL) que no quedo en P1 (maxima prioridad de agenda ECICEP), o G1 (bajo
  // riesgo) que si quedo en P1 — combinaciones donde vale la pena revisar por que ambos modelos difieren.
  esDivergente(estrato: string, tier: string): boolean {
    if (estrato === 'G3' && tier !== 'P1') return true;
    if (estrato === 'G1' && tier === 'P1') return true;
    return false;
  }

  cellClass(estrato: string): string {
    if (estrato === 'G3') return 'cell cell--critical';
    if (estrato === 'G2') return 'cell cell--warning';
    return 'cell cell--good';
  }
}
