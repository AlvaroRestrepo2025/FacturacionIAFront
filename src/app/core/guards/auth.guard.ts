import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/**
 * Protege las rutas que requieren una sesión activa.
 *
 * Si existe un token:
 * permite el acceso.
 *
 * Si no existe un token:
 * redirige al usuario hacia el Login.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};