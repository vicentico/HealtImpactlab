import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../core/api.service';
import { PacienteDetalleDto } from '../core/models';
import { ChipListInputComponent } from '../shared/chip-list-input.component';

@Component({
  selector: 'app-paciente-detalle',
  imports: [
    FormsModule, RouterLink, DatePipe, MatCardModule, MatChipsModule, MatIconModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatCheckboxModule, MatProgressSpinnerModule,
    ChipListInputComponent
  ],
  templateUrl: './paciente-detalle.component.html',
  styleUrl: './paciente-detalle.component.css'
})
export class PacienteDetalleComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  private readonly snackBar = inject(MatSnackBar);

  readonly paciente = signal<PacienteDetalleDto | null>(null);
  readonly loading = signal(true);
  readonly mostrarDerivar = signal(false);
  readonly enviando = signal(false);

  private readonly id: string;

  // Formulario de derivacion a interconsulta — reducido respecto a /ingreso porque el paciente y su
  // vulnerabilidad ya existen (ver docs/11-protocolo-minsal-prompt.md, 4.5).
  especialidadId = 'diabetologia';
  motivo = 'Control de diabetes descompensada';
  hbA1c = 8.5;
  glicemiaAyunas = 160;
  comorbilidades: string[] = [];
  vfg: number | null = null;
  microalbuminuriaRac: number | null = null;
  neuropatiaPrevia = false;
  urgenciasUltimos90Dias = 0;
  numeroFarmacosActivos = 0;
  alertasClinicas: string[] = [];

  constructor() {
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.cargar();
  }

  async cargar(): Promise<void> {
    this.loading.set(true);
    try {
      const p = await this.api.obtenerPaciente(this.id);
      this.paciente.set(p);
      // Precarga el formulario de derivacion con el ultimo antecedente conocido, para no partir de cero.
      const ultimo = p.antecedentes[0];
      if (ultimo) {
        this.comorbilidades = [...ultimo.comorbilidades];
        this.numeroFarmacosActivos = ultimo.numeroFarmacosActivos;
      }
    } catch {
      this.snackBar.open('No se pudo cargar el paciente.', 'Cerrar');
    } finally {
      this.loading.set(false);
    }
  }

  toggleDerivar(): void {
    this.mostrarDerivar.set(!this.mostrarDerivar());
  }

  async derivar(): Promise<void> {
    this.enviando.set(true);
    try {
      const { listaEsperaItemId } = await this.api.registrarInterconsulta({
        pacienteId: this.id,
        especialidadId: this.especialidadId,
        motivo: this.motivo,
        hbA1c: this.hbA1c,
        glicemiaAyunas: this.glicemiaAyunas,
        comorbilidades: this.comorbilidades,
        vfg: this.vfg,
        microalbuminuriaRac: this.microalbuminuriaRac,
        neuropatiaPrevia: this.neuropatiaPrevia,
        urgenciasUltimos90Dias: this.urgenciasUltimos90Dias,
        alertasClinicas: this.alertasClinicas,
        numeroFarmacosActivos: this.numeroFarmacosActivos
      });
      await this.router.navigate(['/casos', listaEsperaItemId]);
    } catch {
      this.snackBar.open('No se pudo registrar la interconsulta. Revisa que la API este corriendo.', 'Cerrar');
    } finally {
      this.enviando.set(false);
    }
  }
}
