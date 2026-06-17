import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';

import { AuthService } from '../services/auth.service';

/**
 * Agrega automáticamente el token de autenticación
 * a las solicitudes HTTP cuando existe una sesión.
 */
export const authInterceptor: HttpInterceptorFn = (
  request,
  next
) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  /*
   * Si no existe un token, la solicitud continúa
   * sin agregar el encabezado Authorization.
   */
  if (!token) {
    return next(request);
  }

  /*
   * Las solicitudes HTTP son inmutables.
   * Por eso se crea una copia con el encabezado.
   */
  const authenticatedRequest = request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authenticatedRequest);
};