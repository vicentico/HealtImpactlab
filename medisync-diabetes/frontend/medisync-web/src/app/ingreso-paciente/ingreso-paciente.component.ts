import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../core/api.service';
import { ChipListInputComponent } from '../shared/chip-list-input.component';

@Component({
  selector: 'app-ingreso-paciente',
  imports: [
    FormsModule, MatStepperModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatCheckboxModule, MatButtonModule, MatIconModule, ChipListInputComponent
  ],
  templateUrl: './ingreso-paciente.component.html',
  styleUrl: './ingreso-paciente.component.css'
})
export class IngresoPacienteComponent {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly breakpointObserver = inject(BreakpointObserver);

  // El stepper horizontal no cabe comodo en pantallas chicas — pasa a vertical, no solo se achica.
  readonly stepperOrientation = toSignal(
    this.breakpointObserver.observe('(max-width: 720px)').pipe(
      map(({ matches }): 'vertical' | 'horizontal' => (matches ? 'vertical' : 'horizontal'))
    ),
    { initialValue: 'horizontal' as const }
  );

  readonly submitting = signal(false);

  // Paciente
  run = '';
  nombre = '';
  fechaNacimiento = '';
  cesfamOrigenId = 'cesfam-001';

  // Vulnerabilidad (factor ECICEP, peso 0.15)
  dependenciaSevera = false;
  ruralidad = false;
  determinantesSociales: string[] = [];

  // Interconsulta (se dispara automaticamente tras registrar al paciente)
  especialidadId = 'diabetologia';
  motivo = 'Control de diabetes descompensada';
  hbA1c = 8.5;
  glicemiaAyunas = 160;
  comorbilidades: string[] = ['Hipertension'];

  // Severidad (ECICEP, peso 0.40) y Urgencia_Reciente (peso 0.25) — todos opcionales
  vfg: number | null = null;
  microalbuminuriaRac: number | null = null;
  neuropatiaPrevia = false;
  urgenciasUltimos90Dias = 0;

  // Si se completa, el Risk Agent deriva el caso de inmediato sin calcular el score normal
  alertasClinicas: string[] = [];

  async registrarYDerivar(): Promise<void> {
    this.submitting.set(true);
    try {
      const { pacienteId } = await this.api.registrarPaciente({
        run: this.run,
        nombre: this.nombre,
        fechaNacimiento: this.fechaNacimiento,
        cesfamOrigenId: this.cesfamOrigenId,
        dependenciaSevera: this.dependenciaSevera,
        ruralidad: this.ruralidad,
        determinantesSociales: this.determinantesSociales
      });

      const { listaEsperaItemId } = await this.api.registrarInterconsulta({
        pacienteId,
        especialidadId: this.especialidadId,
        motivo: this.motivo,
        hbA1c: this.hbA1c,
        glicemiaAyunas: this.glicemiaAyunas,
        comorbilidades: this.comorbilidades,
        vfg: this.vfg,
        microalbuminuriaRac: this.microalbuminuriaRac,
        neuropatiaPrevia: this.neuropatiaPrevia,
        urgenciasUltimos90Dias: this.urgenciasUltimos90Dias,
        alertasClinicas: this.alertasClinicas
      });

      await this.router.navigate(['/casos', listaEsperaItemId]);
    } catch (err) {
      this.snackBar.open(
        'No se pudo registrar el caso. Revisa que la API este corriendo y que la API key de Anthropic este configurada.',
        'Cerrar'
      );
    } finally {
      this.submitting.set(false);
    }
  }
}
