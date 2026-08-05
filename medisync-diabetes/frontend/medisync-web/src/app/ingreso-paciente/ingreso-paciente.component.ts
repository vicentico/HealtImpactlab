import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../core/api.service';

@Component({
  selector: 'app-ingreso-paciente',
  imports: [FormsModule],
  templateUrl: './ingreso-paciente.component.html',
  styleUrl: './ingreso-paciente.component.css'
})
export class IngresoPacienteComponent {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  // Paciente
  run = '';
  nombre = '';
  fechaNacimiento = '';
  cesfamOrigenId = 'cesfam-001';

  // Interconsulta (se dispara automaticamente tras registrar al paciente)
  especialidadId = 'diabetologia';
  motivo = 'Control de diabetes descompensada';
  hbA1c = 8.5;
  glicemiaAyunas = 160;
  comorbilidadesTexto = 'Hipertension';

  async registrarYDerivar(): Promise<void> {
    this.submitting.set(true);
    this.error.set(null);
    try {
      const { pacienteId } = await this.api.registrarPaciente({
        run: this.run,
        nombre: this.nombre,
        fechaNacimiento: this.fechaNacimiento,
        cesfamOrigenId: this.cesfamOrigenId
      });

      const comorbilidades = this.comorbilidadesTexto
        .split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0);

      const { listaEsperaItemId } = await this.api.registrarInterconsulta({
        pacienteId,
        especialidadId: this.especialidadId,
        motivo: this.motivo,
        hbA1c: this.hbA1c,
        glicemiaAyunas: this.glicemiaAyunas,
        comorbilidades
      });

      await this.router.navigate(['/casos', listaEsperaItemId]);
    } catch (err) {
      this.error.set('No se pudo registrar el caso. Revisa que la API este corriendo y que la API key de Anthropic este configurada.');
    } finally {
      this.submitting.set(false);
    }
  }
}
