import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { SessionService } from '../../../core/services/session.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly sessionService = inject(SessionService);
  private readonly router = inject(Router);

  private readonly lastLogoutRecordKey =
    'facturacionia_last_logout';

  private logoutMessageTimeoutId: ReturnType<typeof setTimeout> | null =
    null;

  usuario = '';
  password = '';
  cargando = false;
  mensajeError = '';
  logoutMessage: string | null = null;

  ngOnInit(): void {
    const logoutRecord = this.authService.getLastLogoutRecord();

    this.limpiarSeguridadAlEntrarLogin();

    this.cargarMensajeCierreSesionUnaSolaVez(logoutRecord);
  }

  ngOnDestroy(): void {
    if (this.logoutMessageTimeoutId) {
      clearTimeout(this.logoutMessageTimeoutId);
      this.logoutMessageTimeoutId = null;
    }
  }

  login(): void {
    this.limpiarMensaje();

    if (!this.usuario.trim()) {
      this.mostrarError('El campo usuario es obligatorio.');
      return;
    }

    if (!this.password.trim()) {
      this.mostrarError('El campo contraseña es obligatorio.');
      return;
    }

    this.cargando = true;

    this.loginBD();
  }

  private loginBD(): void {
    this.authService.loginLocal(this.usuario.trim(), this.password)
      .subscribe({
        next: (resp) => {
          const resultado = resp?.resultado ?? resp?.Resultado;

          const usuarioBD = Array.isArray(resultado)
            ? resultado[0]
            : resultado;

          if (!usuarioBD) {
            this.cargando = false;
            this.mostrarError('Usuario no encontrado en el sistema local.');
            return;
          }

          const perteneceFacturacion =
            this.authService.perteneceFacturacion(usuarioBD);

          const perteneceContabler =
            this.authService.perteneceContabler(usuarioBD);

          if (!perteneceFacturacion && !perteneceContabler) {
            this.cargando = false;
            this.mostrarError('El usuario no se encuentra autorizado para ingresar.');
            return;
          }

          this.guardarDatosUsuario(usuarioBD);

          this.ingresarSistema(
            resp?.jwt ?? resp?.JWT ?? null,
            usuarioBD
          );
        },
        error: () => {
          this.cargando = false;
          this.mostrarError('Usuario o contraseña incorrectos.');
        }
      });
  }

  private limpiarSeguridadAlEntrarLogin(): void {
    if (this.logoutMessageTimeoutId) {
      clearTimeout(this.logoutMessageTimeoutId);
      this.logoutMessageTimeoutId = null;
    }

    this.logoutMessage = null;
    this.mensajeError = '';
    this.cargando = false;

    this.sessionService.clearSession();

    localStorage.removeItem(this.lastLogoutRecordKey);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('perfil');

    sessionStorage.clear();

    this.borrarCookiesAccesibles();
  }

  private cargarMensajeCierreSesionUnaSolaVez(record: any | null): void {
    if (!record) {
      return;
    }

    this.logoutMessage = record.tipoCierre === 'Inactividad'
      ? 'Tu sesión fue cerrada por inactividad.'
      : 'Sesión cerrada correctamente.';

    this.logoutMessageTimeoutId = setTimeout(() => {
      this.logoutMessage = null;
      this.logoutMessageTimeoutId = null;
    }, 5000);
  }

  private borrarCookiesAccesibles(): void {
    if (!document.cookie) {
      return;
    }

    const cookies = document.cookie.split(';');

    for (const cookie of cookies) {
      const nombreCookie = cookie.split('=')[0]?.trim();

      if (!nombreCookie) {
        continue;
      }

      document.cookie =
        `${nombreCookie}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;

      document.cookie =
        `${nombreCookie}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
    }
  }

  private ingresarSistema(token: string | null, usuario: any): void {
    const tokenFinal = token ?? '';

    this.sessionService.saveSession(
      tokenFinal,
      usuario,
      'UsuarioInterno'
    );

    this.cargando = false;

    void this.router.navigateByUrl('/dashboard', {
      replaceUrl: true
    });
  }

  private guardarDatosUsuario(usuario: any): void {
    sessionStorage.setItem(
      'Rol',
      usuario?.cargo ??
      usuario?.Cargo ??
      usuario?.rol ??
      usuario?.Rol ??
      ''
    );

    sessionStorage.setItem(
      'Nombre',
      usuario?.nombre ??
      usuario?.Nombre ??
      usuario?.name ??
      usuario?.Name ??
      ''
    );

    sessionStorage.setItem(
      'Apellido',
      usuario?.apellido ??
      usuario?.Apellido ??
      ''
    );

    sessionStorage.setItem(
      'Correo',
      usuario?.correo ??
      usuario?.Correo ??
      usuario?.email ??
      usuario?.Email ??
      ''
    );
  }

  private mostrarError(mensaje: string): void {
    this.mensajeError = mensaje;
  }

  private limpiarMensaje(): void {
    this.mensajeError = '';
    this.logoutMessage = null;
  }
}