import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/**
 * Controla el acceso a rutas públicas como Login.
 *
 * Si el usuario ya tiene una sesión activa,
 * no debe volver al Login y será enviado al Dashboard.
 *
 * Si no tiene sesión activa,
 * puede permanecer en el Login.
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};