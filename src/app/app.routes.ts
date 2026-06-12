import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'usuarios-externos',
        loadComponent: () =>
          import('./feature/external-users/external-users-list/external-users-list.component').then(
            (m) => m.ExternalUsersListComponent
          ),
      },
      {
        path: '',
        redirectTo: 'usuarios-externos',
        pathMatch: 'full',
      },
    ],
  },
];