import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

import { environment } from '../../../environments/environment';

import { LogoutRecord } from '../../shared/models/logout-record.model';
import { LogoutRequest } from '../../shared/models/logout-request.model';
import { LogoutType } from '../../shared/models/logout-type.model';

interface LogoutResponse {
  exito: boolean;
  mensaje: string;
  idAuditoriaCierreSesion?: number | null;
  fechaCierre?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  /*
   * Claves utilizadas para almacenar temporalmente
   * la información de autenticación.
   */
  private readonly tokenKey = 'facturacionia_token';
  private readonly userKey = 'facturacionia_user';

  /*
   * Registro temporal del último cierre de sesión.
   * Se conserva para mostrar el mensaje visual en Login.
   */
  private readonly lastLogoutRecordKey =
    'facturacionia_last_logout';

  private readonly logoutUrl = `${environment.apiUrl}/auth/logout`;

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
   * Primero intenta registrar el cierre en backend.
   * Luego limpia la sesión local y redirige al Login.
   */
  logout(type: LogoutType): void {
    const request: LogoutRequest = {
      tipoCierre: type
    };

    this.http.post<LogoutResponse>(
      this.logoutUrl,
      request
    ).subscribe({
      next: (response) => {
        this.saveLogoutRecord(
          type,
          response.fechaCierre ?? new Date().toISOString()
        );

        this.finalizeLogout();
      },
      error: (error) => {
        console.error(
          'No fue posible registrar el cierre de sesión en backend:',
          error
        );

        this.saveLogoutRecord(
          type,
          new Date().toISOString()
        );

        this.finalizeLogout();
      }
    });
  }

  /**
   * Guarda el último cierre para que el Login
   * pueda mostrar el mensaje correspondiente.
   */
  private saveLogoutRecord(
    type: LogoutType,
    fechaHoraUtc: string
  ): void {
    const logoutRecord: LogoutRecord = {
      tipoCierre: type,
      fechaHoraUtc
    };

    localStorage.setItem(
      this.lastLogoutRecordKey,
      JSON.stringify(logoutRecord)
    );
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