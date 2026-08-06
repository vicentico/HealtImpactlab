import { Routes } from '@angular/router';
import { ListaEsperaComponent } from './lista-espera/lista-espera.component';
import { IngresoPacienteComponent } from './ingreso-paciente/ingreso-paciente.component';
import { DetalleCasoComponent } from './detalle-caso/detalle-caso.component';
import { KpisComponent } from './kpis/kpis.component';

export const routes: Routes = [
  { path: '', component: ListaEsperaComponent },
  { path: 'ingreso', component: IngresoPacienteComponent },
  { path: 'casos/:id', component: DetalleCasoComponent },
  { path: 'kpis', component: KpisComponent },
  { path: '**', redirectTo: '' }
];
