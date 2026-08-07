import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../core/api.service';
import { PacienteResumenDto } from '../core/models';

@Component({
  selector: 'app-pacientes',
  imports: [
    FormsModule, RouterLink, MatTableModule, MatFormFieldModule, MatInputModule,
    MatIconModule, MatButtonModule, MatProgressSpinnerModule
  ],
  templateUrl: './pacientes.component.html',
  styleUrl: './pacientes.component.css'
})
export class PacientesComponent {
  private readonly api = inject(ApiService);

  readonly displayedColumns = ['nombre', 'run', 'edad', 'cesfam', 'acciones'];
  readonly pacientes = signal<PacienteResumenDto[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  texto = '';

  constructor() {
    this.buscar();
  }

  async buscar(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.pacientes.set(await this.api.listarPacientes(this.texto || undefined));
    } catch {
      this.error.set('No se pudo cargar la lista de pacientes.');
    } finally {
      this.loading.set(false);
    }
  }
}
