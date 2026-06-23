import {
  Injectable
} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private readonly TOKEN_KEY =
    'token';

  private readonly USER_KEY =
    'usuario';

  private readonly PROFILE_KEY =
    'perfil';

  constructor() { }

  /**
   * Guarda la sesión completa.
   */
  saveSession(
    token: string | null,
    usuario: any,
    perfil: string = 'UsuarioInterno'
  ): void {

    if (token) {

      localStorage.setItem(
        this.TOKEN_KEY,
        token
      );
    }

    if (usuario) {

      localStorage.setItem(
        this.USER_KEY,
        JSON.stringify(usuario)
      );
    }

    localStorage.setItem(
      this.PROFILE_KEY,
      perfil
    );
  }

  /**
   * Obtiene el JWT.
   */
  getToken(): string | null {

    return localStorage.getItem(
      this.TOKEN_KEY
    );
  }

  /**
   * Obtiene el usuario autenticado.
   */
  getUser(): any {

    const usuario =
      localStorage.getItem(
        this.USER_KEY
      );

    if (!usuario) {

      return null;
    }

    return JSON.parse(
      usuario
    );
  }

  /**
   * Obtiene el perfil.
   */
  getProfile(): string | null {

    return localStorage.getItem(
      this.PROFILE_KEY
    );
  }

  /**
   * Verifica si existe sesión.
   */
  isAuthenticated(): boolean {

    const token =
      this.getToken();

    return !!token;
  }

  /**
   * Elimina la sesión.
   */
  clearSession(): void {

    localStorage.removeItem(
      this.TOKEN_KEY
    );

    localStorage.removeItem(
      this.USER_KEY
    );

    localStorage.removeItem(
      this.PROFILE_KEY
    );
  }

  /**
   * Cierra la sesión.
   */
  logout(): void {

    this.clearSession();
  }
}