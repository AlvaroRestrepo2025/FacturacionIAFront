import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { contablerGuard } from './core/guards/contabler.guard';
import { facturacionGuard } from './core/guards/facturacion.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (component) => component.LoginComponent,
      ),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(
        (component) => component.MainLayoutComponent,
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (component) => component.DashboardComponent,
          ),
      },
      {
        path: 'empresas',
        canActivate: [facturacionGuard],
        loadComponent: () =>
          import('./features/empresas/empresas.component').then(
            (component) => component.EmpresasComponent,
          ),
      },
      {
        path: 'registros-facturacion',
        canActivate: [facturacionGuard],
        loadComponent: () =>
          import('./features/registros-facturacion/registros-facturacion.component').then(
            (component) => component.RegistrosFacturacionComponent,
          ),
      },
      {
        path: 'usuarios-externos',
        canActivate: [contablerGuard],
        loadComponent: () =>
          import('./features/external-users/external-users-list/external-users-list.component').then(
            (component) => component.ExternalUsersListComponent,
          ),
      },
    ],
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];