import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { SessionService } from '../../../core/services/session.service';
import { LogoutRecord } from '../../../shared/models/logout-record.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly sessionService = inject(SessionService);
  private readonly router = inject(Router);

  usuario = '';
  password = '';
  cargando = false;
  mensajeError = '';

  get lastLogoutRecord(): LogoutRecord | null {
    return this.authService.getLastLogoutRecord();
  }

  get logoutMessage(): string | null {
    const record = this.lastLogoutRecord;

    if (!record) {
      return null;
    }

    return record.tipoCierre === 'Inactividad'
      ? 'Tu sesión fue cerrada por inactividad.'
      : 'Sesión cerrada correctamente.';
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

    this.authService.loginLDAP(this.usuario.trim(), this.password)
      .subscribe({
        next: (resp) => {
          const respuesta = resp?.respuesta ?? resp?.Respuesta;
          const resultado = resp?.resultado ?? resp?.Resultado;

          if (respuesta === false) {
            this.loginBD();
            return;
          }

          const usuarioLDAP = Array.isArray(resultado)
            ? resultado[0]
            : resultado;

          if (!usuarioLDAP) {
            this.loginBD();
            return;
          }

          const perteneceFacturacion = this.authService.perteneceFacturacion(usuarioLDAP);
          const perteneceContabler = this.authService.perteneceContabler(usuarioLDAP);

          if (!perteneceFacturacion && !perteneceContabler) {
            this.cargando = false;
            this.mostrarError('El usuario no pertenece al área de Facturación o Contabler.');
            return;
          }

          this.guardarDatosUsuario(usuarioLDAP);

          this.ingresarSistema(
            resp?.jwt ?? resp?.JWT ?? null,
            usuarioLDAP
          );
        },
        error: () => {
          this.loginBD();
        }
      });
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

          const perteneceFacturacion = this.authService.perteneceFacturacion(usuarioBD);
          const perteneceContabler = this.authService.perteneceContabler(usuarioBD);

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
          this.mostrarError('Usuario o contraseña incorrectos, o el servicio no está disponible.');
        }
      });
  }

  private ingresarSistema(token: string | null, usuario: any): void {
    const tokenFinal = token ?? 'token-local-facturacion-ia';

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
    sessionStorage.setItem('Rol', usuario?.cargo ?? usuario?.Cargo ?? usuario?.rol ?? usuario?.Rol ?? '');
    sessionStorage.setItem('Nombre', usuario?.nombre ?? usuario?.Nombre ?? usuario?.name ?? usuario?.Name ?? '');
    sessionStorage.setItem('Apellido', usuario?.apellido ?? usuario?.Apellido ?? '');
    sessionStorage.setItem('Correo', usuario?.correo ?? usuario?.Correo ?? usuario?.email ?? usuario?.Email ?? '');
  }

  private mostrarError(mensaje: string): void {
    this.mensajeError = mensaje;
  }

  private limpiarMensaje(): void {
    this.mensajeError = '';
  }
}