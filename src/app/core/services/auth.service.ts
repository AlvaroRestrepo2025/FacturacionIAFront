import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

import { LogoutRecord } from '../../shared/models/logout-record.model';
import { LogoutRequest } from '../../shared/models/logout-request.model';
import { LogoutType } from '../../shared/models/logout-type.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly router = inject(Router);

  /*
   * Claves utilizadas para almacenar temporalmente
   * la información de autenticación.
   */
  private readonly tokenKey = 'facturacionia_token';
  private readonly userKey = 'facturacionia_user';

  /*
   * Registro temporal del último cierre de sesión.
   * Se eliminará cuando el backend registre la auditoría.
   */
  private readonly lastLogoutRecordKey =
    'facturacionia_last_logout';

  /**
   * Guarda los datos principales de la sesión.
   */
  saveSession(token: string, user: unknown): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(
      this.userKey,
      JSON.stringify(user)
    );
  }

  /**
   * Comprueba si existe un token de autenticación.
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem(this.tokenKey);

    return token !== null && token.trim() !== '';
  }

  /**
   * Retorna el token almacenado.
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Obtiene el último registro temporal de cierre.
   */
  getLastLogoutRecord(): LogoutRecord | null {
    const storedRecord = localStorage.getItem(
      this.lastLogoutRecordKey
    );

    if (!storedRecord) {
      return null;
    }

    try {
      return JSON.parse(storedRecord) as LogoutRecord;
    } catch {
      localStorage.removeItem(this.lastLogoutRecordKey);
      return null;
    }
  }

  /**
   * Elimina las credenciales temporales
   * almacenadas por el frontend.
   */
  clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);

    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.userKey);
  }

  /**
   * Inicia el proceso de cierre de sesión.
   */
  logout(type: LogoutType): void {
    const request: LogoutRequest = {
      tipoCierre: type
    };

    const temporaryRecord: LogoutRecord = {
      tipoCierre: type,
      fechaHoraUtc: new Date().toISOString()
    };

    localStorage.setItem(
      this.lastLogoutRecordKey,
      JSON.stringify(temporaryRecord)
    );

    console.info(
      'Solicitud de cierre de sesión:',
      request
    );

    console.info(
      'Registro temporal del cierre:',
      temporaryRecord
    );

    this.finalizeLogout();
  }

  /**
   * Finaliza la sesión en el navegador
   * y redirige al usuario al Login.
   */
  private finalizeLogout(): void {
    this.clearSession();

    void this.router.navigateByUrl('/login', {
      replaceUrl: true
    });
  }
}