import { Injectable, inject } from '@angular/core';

import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SessionInactivityService {
  private readonly authService = inject(AuthService);

  /**
   * Tiempo máximo permitido sin actividad:
   * 60 minutos = 1 hora.
   */
  private readonly inactivityDurationMs = 60 * 60 * 1000;

  /**
   * Identificador del temporizador activo.
   */
  private timeoutId: number | null = null;

  /**
   * Evita registrar varias veces los mismos eventos.
   */
  private isMonitoring = false;

  /**
   * Acciones consideradas actividad del usuario.
   */
  private readonly activityEvents: Array<keyof WindowEventMap> = [
    'click',
    'keydown',
    'mousemove',
    'scroll',
    'touchstart'
  ];

  /**
   * Conservamos una única referencia de la función
   * para poder agregarla y eliminarla correctamente.
   */
  private readonly handleActivity = (): void => {
    this.resetTimer();
  };

  /**
   * Comienza a vigilar la actividad del usuario.
   */
  startMonitoring(): void {
    if (!this.authService.isAuthenticated()) {
      return;
    }

    if (!this.isMonitoring) {
      this.activityEvents.forEach((eventName) => {
        window.addEventListener(eventName, this.handleActivity);
      });

      this.isMonitoring = true;
    }

    this.resetTimer();
  }

  /**
   * Detiene la vigilancia y elimina el temporizador.
   */
  stopMonitoring(): void {
    if (this.isMonitoring) {
      this.activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, this.handleActivity);
      });

      this.isMonitoring = false;
    }

    this.clearTimer();
  }

  /**
   * Reinicia el contador cada vez que se detecta actividad.
   */
  private resetTimer(): void {
    if (!this.authService.isAuthenticated()) {
      this.stopMonitoring();
      return;
    }

    this.clearTimer();

    this.timeoutId = window.setTimeout(() => {
      this.stopMonitoring();
      this.authService.logout('Inactividad');
    }, this.inactivityDurationMs);
  }

  /**
   * Elimina el temporizador anterior, cuando existe.
   */
  private clearTimer(): void {
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}