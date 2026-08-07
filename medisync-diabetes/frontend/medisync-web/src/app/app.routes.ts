import { Routes } from '@angular/router';
import { ListaEsperaComponent } from './lista-espera/lista-espera.component';
import { IngresoPacienteComponent } from './ingreso-paciente/ingreso-paciente.component';
import { DetalleCasoComponent } from './detalle-caso/detalle-caso.component';
import { KpisComponent } from './kpis/kpis.component';
import { PacientesComponent } from './pacientes/pacientes.component';
import { PacienteDetalleComponent } from './pacientes/paciente-detalle.component';
import { MatrizRiesgoComponent } from './matriz-riesgo/matriz-riesgo.component';

export const routes: Routes = [
  { path: '', component: ListaEsperaComponent },
  { path: 'ingreso', component: IngresoPacienteComponent },
  { path: 'casos/:id', component: DetalleCasoComponent },
  { path: 'kpis', component: KpisComponent },
  { path: 'matriz-riesgo', component: MatrizRiesgoComponent },
  { path: 'pacientes', component: PacientesComponent },
  { path: 'pacientes/:id', component: PacienteDetalleComponent },
  { path: '**', redirectTo: '' }
];
