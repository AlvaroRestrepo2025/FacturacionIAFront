import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/**
 * Protege rutas que pueden ser usadas por usuarios
 * del área de Facturación o por usuarios Contabler.
 *
 * Se usa para HU-008: Registros para facturación.
 */
export const facturacionContablerGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  if (authService.isFacturacionOrContablerUser()) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
