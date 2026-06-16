import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { LogoutRecord } from '../../../shared/models/logout-record.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  /**
   * Obtiene el último cierre registrado temporalmente.
   */
  get lastLogoutRecord(): LogoutRecord | null {
    return this.authService.getLastLogoutRecord();
  }

  /**
   * Mensaje visual según el último tipo de cierre.
   */
  get logoutMessage(): string | null {
    const record = this.lastLogoutRecord;

    if (!record) {
      return null;
    }

    if (record.tipoCierre === 'Inactividad') {
      return 'Tu sesión fue cerrada por inactividad.';
    }

    return 'Sesión cerrada correctamente.';
  }

  /**
   * Crea una sesión temporal para probar la HU-002.
   *
   * Este método se reemplazará cuando la HU-001
   * esté conectada con la API real de autenticación.
   */
  temporaryLogin(): void {
    const temporaryUser = {
      name: 'Usuario',
      role: 'Usuario del sistema'
    };

    this.authService.saveSession(
      'token-temporal-facturacionia',
      temporaryUser
    );

    void this.router.navigateByUrl('/dashboard', {
      replaceUrl: true
    });
  }
}