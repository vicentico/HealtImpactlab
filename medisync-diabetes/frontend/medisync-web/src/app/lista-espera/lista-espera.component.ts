import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { ListaEsperaItemDto } from '../core/models';

@Component({
  selector: 'app-lista-espera',
  imports: [RouterLink],
  templateUrl: './lista-espera.component.html',
  styleUrl: './lista-espera.component.css'
})
export class ListaEsperaComponent {
  private readonly api = inject(ApiService);

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

  tierClass(tier: string | null): string {
    if (tier === 'P1') return 'tier tier-p1';
    if (tier === 'P2') return 'tier tier-p2';
    if (tier === 'P3') return 'tier tier-p3';
    return 'tier tier-pendiente';
  }
}
