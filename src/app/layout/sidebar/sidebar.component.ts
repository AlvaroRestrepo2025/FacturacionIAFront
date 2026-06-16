import { Component, inject } from '@angular/core';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);

  /**
   * Ejecuta el cierre manual de sesión.
   *
   * Se utiliza cuando el usuario selecciona
   * la opción "Cerrar sesión" del menú lateral.
   */
  logout(): void {
    this.authService.logout('Manual');
  }
}