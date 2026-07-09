import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);

  isCollapsed = false;

  get nombreUsuario(): string {
    const nombre = sessionStorage.getItem('Nombre') ?? '';
    const apellido = sessionStorage.getItem('Apellido') ?? '';

    const nombreCompleto = `${nombre} ${apellido}`.trim();

    return nombreCompleto || 'Usuario';
  }

  get rolUsuario(): string {
    return sessionStorage.getItem('Rol') || 'Usuario del sistema';
  }

  get mostrarPanelPrincipal(): boolean {
    return this.authService.isFacturacionOrContablerUser();
  }

  get mostrarMenuEmpresas(): boolean {
    return this.authService.isFacturacionUser();
  }

  get mostrarMenuRegistrosFacturacion(): boolean {
    return this.authService.isFacturacionUser();
  }

  get mostrarMenuUsuariosExternos(): boolean {
    return this.authService.isContablerUser();
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  logout(): void {
    this.authService.logout('Manual');
  }
}