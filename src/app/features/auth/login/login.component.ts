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

  /**
   * Último cierre de sesión registrado.
   */
  get lastLogoutRecord(): LogoutRecord | null {
    return this.authService.getLastLogoutRecord();
  }

  /**
   * Mensaje mostrado después de cerrar sesión.
   */
  get logoutMessage(): string | null {
    const record = this.lastLogoutRecord;

    if (!record) {
      return null;
    }

    return record.tipoCierre === 'Inactividad'
      ? 'Tu sesión fue cerrada por inactividad.'
      : 'Sesión cerrada correctamente.';
  }

  /**
   * Login temporal usado durante desarrollo.
   *
   * Se conserva para poder entrar al sistema mientras
   * se valida la autenticación definitiva.
   */
  temporaryLogin(): void {
    const temporaryUser = {
      name: 'Usuario',
      role: 'Usuario del sistema',
      area: 'Facturacion'
    };

    this.sessionService.saveSession(
      'temporary-token',
      temporaryUser,
      'UsuarioInterno'
    );

    void this.router.navigateByUrl('/dashboard', {
      replaceUrl: true
    });
  }

  /**
   * Login principal contra LDAP.
   */
  login(): void {
    if (!this.usuario || !this.password) {
      alert('Ingrese usuario y contraseña.');
      return;
    }

    this.cargando = true;

    this.authService.loginLDAP(this.usuario, this.password)
      .subscribe({
        next: (resp) => {
          this.cargando = false;
          console.log('RESP LDAP:', resp);

          const respuesta = resp?.respuesta ?? resp?.Respuesta;
          const resultado = resp?.resultado ?? resp?.Resultado;

          if (respuesta === false) {
            console.warn('LDAP respondió false → fallback BD');
            this.loginBD();
            return;
          }

          const usuarioLDAP = Array.isArray(resultado)
            ? resultado[0]
            : resultado;

          if (!usuarioLDAP) {
            console.warn('LDAP sin usuario → fallback BD');
            this.loginBD();
            return;
          }

          const pertenece = this.authService.perteneceFacturacion(usuarioLDAP);

          if (!pertenece) {
            alert('El usuario no pertenece al área de Facturación');
            void this.router.navigateByUrl('/acceso-denegado');
            return;
          }

          this.ingresarSistema(
            resp?.jwt ?? resp?.JWT ?? null,
            usuarioLDAP
          );
        },
        error: (err) => {
          console.error('❌ ERROR LDAP:', err);
          this.loginBD();
        }
      });
  }

  /**
   * Login de contingencia contra base de datos local.
   */
  private loginBD(): void {
    console.log('🔁 LOGIN BD LOCAL');
    console.log('Usuario:', this.usuario);
    console.log('Password:', this.password);

    this.authService.loginLocal(this.usuario, this.password)
      .subscribe({
        next: (resp) => {
          this.cargando = false;
          console.log('RESP LOCAL:', resp);

          const resultado = resp?.resultado ?? resp?.Resultado;

          const usuarioBD = Array.isArray(resultado)
            ? resultado[0]
            : resultado;

          if (!usuarioBD) {
            alert('Usuario no encontrado en sistema local.');
            return;
          }

          const pertenece = this.authService.perteneceFacturacion(usuarioBD);

          if (!pertenece) {
            alert('El usuario no pertenece a Facturación');
            void this.router.navigateByUrl('/acceso-denegado');
            return;
          }

          this.ingresarSistema(
            resp?.jwt ?? resp?.JWT ?? null,
            usuarioBD
          );
        },
        error: (err) => {
          console.error('❌ ERROR LOGIN LOCAL:', err);

          this.cargando = false;

          alert('Usuario o contraseña incorrectos o servicio no disponible.');
        }
      });
  }

  /**
   * Guarda la sesión y redirige al dashboard.
   */
  private ingresarSistema(
    token: string | null,
    usuario: any
  ): void {
    console.log('✅ INGRESO SISTEMA');

    this.sessionService.saveSession(
      token,
      usuario,
      'UsuarioInterno'
    );

    void this.router.navigateByUrl('/dashboard', {
      replaceUrl: true
    });
  }
}