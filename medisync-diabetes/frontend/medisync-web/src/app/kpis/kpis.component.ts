import { Component, computed, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../core/api.service';
import { KpisDto } from '../core/models';

type Estado = 'critical' | 'warning' | 'good' | 'neutral';

const TIER_ORDER = ['P1', 'P2', 'P3'] as const;

@Component({
  selector: 'app-kpis',
  imports: [MatCardModule, MatIconModule, MatProgressBarModule, MatProgressSpinnerModule, MatButtonModule],
  templateUrl: './kpis.component.html',
  styleUrl: './kpis.component.css'
})
export class KpisComponent {
  private readonly api = inject(ApiService);

  readonly kpis = signal<KpisDto | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly tierBars = computed(() => {
    const kpis = this.kpis();
    if (!kpis) return [];
    const total = TIER_ORDER.reduce((sum, t) => sum + (kpis.distribucionPorPriorityTier[t] ?? 0), 0);
    return TIER_ORDER.map(tier => {
      const count = kpis.distribucionPorPriorityTier[tier] ?? 0;
      return { tier, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 };
    });
  });

  readonly estadoRows = computed(() => {
    const kpis = this.kpis();
    if (!kpis) return [];
    return Object.entries(kpis.distribucionPorEstado).sort((a, b) => b[1] - a[1]);
  });

  constructor() {
    this.cargar();
  }

  async cargar(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.kpis.set(await this.api.obtenerKpis());
    } catch {
      this.error.set('No se pudo cargar los KPIs. ¿Está corriendo MediSync.Api en http://localhost:5182?');
    } finally {
      this.loading.set(false);
    }
  }

  tileClass(estado: Estado): string {
    return `kpi-card kpi-card--${estado}`;
  }

  // El dossier ECICEP cita 15,6% de NSP como el problema actual a resolver: por eso ese piso ya
  // cuenta como "warning" (no como "good") y solo se considera resuelto bajo el 10%.
  nspStatus(tasa: number): Estado {
    if (tasa >= 0.25) return 'critical';
    if (tasa >= 0.10) return 'warning';
    return 'good';
  }

  round1(n: number): string {
    return n.toFixed(1);
  }
}
