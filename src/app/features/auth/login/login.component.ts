import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
   * Último logout
   */
  get lastLogoutRecord(): LogoutRecord | null {
    return this.authService.getLastLogoutRecord();
  }

  /**
   * Mensaje logout
   */
  get logoutMessage(): string | null {
    const record = this.lastLogoutRecord;

    if (!record) return null;

    return record.tipoCierre === 'Inactividad'
      ? 'Tu sesión fue cerrada por inactividad.'
      : 'Sesión cerrada correctamente.';
  }

  /**
   * LOGIN PRINCIPAL (LDAP)
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

          /**
           * NORMALIZAR RESPUESTA (evita problemas de mayúsculas/minúsculas)
           */
          const respuesta = resp?.respuesta ?? resp?.Respuesta;
          const resultado = resp?.resultado ?? resp?.Resultado;

          // ❌ LDAP falló o no validó
          if (respuesta === false) {
            console.warn('LDAP respondió false → fallback BD');
            this.loginBD();
            return;
          }

          const usuarioLDAP =
            Array.isArray(resultado)
              ? resultado[0]
              : resultado;

          if (!usuarioLDAP) {
            console.warn('LDAP sin usuario → fallback BD');
            this.loginBD();
            return;
          }

          const pertenece =
            this.authService.perteneceFacturacion(usuarioLDAP);

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

          //alert('LDAP no disponible. Intentando acceso local...');

          this.loginBD();
        }
      });
  }

  /**
   * LOGIN DE CONTINGENCIA (BD LOCAL)
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

          const usuarioBD =
            Array.isArray(resultado)
              ? resultado[0]
              : resultado;

          if (!usuarioBD) {
            alert('Usuario no encontrado en sistema local.');
            return;
          }

          const pertenece =
            this.authService.perteneceFacturacion(usuarioBD);

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
   * INGRESO CENTRALIZADO
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