import {
  HttpClient
} from '@angular/common/http';

import {
  Injectable,
  inject
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  Observable
} from 'rxjs';

import {
  environment
} from '../../../environments/environment';

import {
  LogoutRecord
} from '../../shared/models/logout-record.model';

import {
  LogoutRequest
} from '../../shared/models/logout-request.model';

import {
  LogoutType
} from '../../shared/models/logout-type.model';

import {
  SessionService
} from './session.service';

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

  private readonly http =
    inject(HttpClient);

  private readonly router =
    inject(Router);

  private readonly sessionService =
    inject(SessionService);

  private readonly apiAuth =
    environment.apiAuth;

  private readonly logoutUrl =
    `${environment.apiAuth}/auth/logout`;

  private readonly lastLogoutRecordKey =
    'facturacionia_last_logout';

  /**
   * LOGIN LDAP
   */
  loginLDAP(
    usuario: string,
    password: string
  ): Observable<any> {

    const url =
      `${this.apiAuth}/AccesoDirectorioActivo`;

    console.log(
      'URL LDAP:',
      url
    );

    return this.http.post(
      url,
      {
        Credenciales: {
          Usuario: usuario,
          Contrasena: password
        }
      }
    );
  }

  /**
   * LOGIN LOCAL
   */
  loginLocal(
    usuario: string,
    password: string
  ): Observable<any> {

    const url =
      `${this.apiAuth}/AccesoLogginLocal`;

    console.log(
      'URL Login Local:',
      url
    );

    return this.http.post(
      url,
      {
        Credenciales: {
          Usuario: usuario,
          Contrasena: password
        }
      }
    );
  }

  /**
   * REGISTRAR USUARIO
   */
  registrarUsuario(
    usuario: any
  ): Observable<any> {

    return this.http.post(
      `${this.apiAuth}/RegistrarUsuario`,
      usuario
    );
  }


  /**
 * Guarda la sesión actual.
 */
saveSession(
  token: string | null,
  usuario: any,
  perfil = 'UsuarioInterno'
): void {

  this.sessionService
    .saveSession(
      token,
      usuario,
      perfil
    );
}

/**
 * Verifica si existe una sesión activa.
 */
isAuthenticated(): boolean {

  return this.sessionService
    .isAuthenticated();
}

/**
 * Obtiene el token almacenado.
 */
getToken(): string | null {

  return this.sessionService
    .getToken();
}

/**
 * Obtiene el usuario almacenado.
 */
getUser(): any {

  return this.sessionService
    .getUser();
}

/**
 * Limpia la sesión.
 */
clearSession(): void {

  this.sessionService
    .clearSession();
}

  /**
   * Valida si pertenece
   * al área de Facturación.
   */
  perteneceFacturacion(
    usuario: any
  ): boolean {

    console.log(
      'Objeto recibido:',
      usuario
    );

    const area =

      usuario?.Department ||
      usuario?.department ||
      usuario?.Departamento ||
      usuario?.departamento ||
      usuario?.Cargo ||
      usuario?.cargo ||
      usuario?.Descripcion ||
      usuario?.descripcion ||
      '';

    console.log(
      'Área encontrada:',
      area
    );

    const areaNormalizada =

      area
        .toString()
        .normalize('NFD')
        .replace(
          /[\u0300-\u036f]/g,
          ''
        )
        .toUpperCase()
        .trim();

    console.log(
      'Área normalizada:',
      areaNormalizada
    );

    const pertenece =
      areaNormalizada.includes(
        'FACTURACION'
      );

    console.log(
      'Pertenece a Facturación:',
      pertenece
    );

    return pertenece;
  }

  /**
   * Último cierre registrado.
   */
  getLastLogoutRecord():
    LogoutRecord | null {

    const storedRecord =
      localStorage.getItem(
        this.lastLogoutRecordKey
      );

    if (!storedRecord) {

      return null;
    }

    try {

      return JSON.parse(
        storedRecord
      ) as LogoutRecord;
    }
    catch {

      localStorage.removeItem(
        this.lastLogoutRecordKey
      );

      return null;
    }
  }

  /**
   * Cierre de sesión.
   */
  logout(
    type: LogoutType
  ): void {

    const request:
      LogoutRequest = {

      tipoCierre: type
    };

    this.http.post<LogoutResponse>(
      this.logoutUrl,
      request
    )
    .subscribe({

      next: (response) => {

        this.saveLogoutRecord(
          type,
          response.fechaCierre ??
          new Date()
            .toISOString()
        );

        this.finalizeLogout();
      },

      error: (error) => {

        console.error(
          'No fue posible registrar el cierre:',
          error
        );

        this.saveLogoutRecord(
          type,
          new Date()
            .toISOString()
        );

        this.finalizeLogout();
      }
    });
  }

  /**
   * Guarda último cierre.
   */
  private saveLogoutRecord(
    type: LogoutType,
    fechaHoraUtc: string
  ): void {

    const logoutRecord:
      LogoutRecord = {

      tipoCierre: type,
      fechaHoraUtc
    };

    localStorage.setItem(
      this.lastLogoutRecordKey,
      JSON.stringify(
        logoutRecord
      )
    );
  }

  /**
   * Finaliza la sesión.
   */
  private finalizeLogout():
    void {

    this.sessionService
      .clearSession();

    void this.router
      .navigateByUrl(
        '/login',
        {
          replaceUrl: true
        }
      );
  }
}