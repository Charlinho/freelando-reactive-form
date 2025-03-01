import { Routes } from '@angular/router';
import { CadastroFormComponent } from './pages/cadastro-form/cadastro-form.component';

export const routes: Routes = [
  { path: '', redirectTo: '/cadastro/area-atuacao', pathMatch: 'full' },
  { path: 'cadastro/area-atuacao', component: CadastroFormComponent }
];
