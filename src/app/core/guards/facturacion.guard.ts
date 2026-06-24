import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/**
 * Protege rutas que solo deben ser usadas
 * por usuarios del área de Facturación.
 *
 * Para la HU-005 se usa en la pantalla Empresas.
 */
export const facturacionGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  if (authService.isFacturacionUser()) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};