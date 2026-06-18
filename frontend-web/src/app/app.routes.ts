import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard]
  },
  {
    path: 'malla',
    loadComponent: () =>
      import('./components/malla/malla.component').then(m => m.MallaComponent),
    canActivate: [authGuard]
  },
  {
    path: 'horario',
    loadComponent: () =>
      import('./components/horario/horario').then(m => m.Horario),
    canActivate: [authGuard]
  },
  {
    path: 'notas',
    loadComponent: () =>
      import('./components/notas/notas.component').then(m => m.NotasComponent),
    canActivate: [authGuard]
  },
  {
    path: 'calendario',
    loadComponent: () =>
      import('./components/calendario/calendario.component').then(m => m.CalendarioComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'login' }
];