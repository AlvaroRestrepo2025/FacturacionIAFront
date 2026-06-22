import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ExternalUserModalComponent } from '../external-user-modal/external-user-modal.component';
import { ExternalUsersService } from '../../../core/services/external-users.service';
import { ExternalUser } from '../external-user.model';

@Component({
  selector: 'app-external-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ExternalUserModalComponent],
  templateUrl: './external-users-list.component.html',
  styleUrl: './external-users-list.component.css',
})
export class ExternalUsersListComponent implements OnInit {

  users: ExternalUser[] = [];

  searchText = '';
  currentPage = 1;
  pageSize = 10;

  isModalOpen = false;
  modalMode: 'crear' | 'editar' = 'crear';
  selectedUser: ExternalUser | null = null;

  constructor(
    private router: Router,
    private externalUsersService: ExternalUsersService
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.externalUsersService.obtenerUsuarios()
      .subscribe({
        next: (respuesta) => {
          this.users = respuesta;
        },
        error: (error) => {
          console.error('Error cargando usuarios', error);
        }
      });
  }

  get filteredUsers(): ExternalUser[] {
    const term = this.searchText.toLowerCase().trim();

    if (!term) {
      return this.users;
    }

    return this.users.filter(
      (u) =>
        u.nombre.toLowerCase().includes(term) ||
        u.correo.toLowerCase().includes(term) ||
        u.notas.toLowerCase().includes(term)
    );
  }

  get pagedUsers(): ExternalUser[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.pageSize) || 1;
  }

  get pages(): number[] {
    return Array.from(
      { length: this.totalPages },
      (_, i) => i + 1
    );
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  openCrearModal(): void {
    this.modalMode = 'crear';
    this.selectedUser = null;
    this.isModalOpen = true;
  }

  openEditarModal(user: ExternalUser): void {
    this.modalMode = 'editar';
    this.selectedUser = { ...user };
    this.isModalOpen = true;
  }

  onModalClose(): void {
    this.isModalOpen = false;
    this.selectedUser = null;
  }

  onModalSave(user: any): void {

    if (this.modalMode === 'crear') {

      const nuevoUsuario = {
        nombre: user.nombre,
        correo: user.correo,
        notas: user.notas
      };

      this.externalUsersService
        .crearUsuario(nuevoUsuario)
        .subscribe({
          next: () => {

            this.isModalOpen = false;

            this.cargarUsuarios();

            alert('Usuario creado correctamente');
          },
          error: (error) => {
            console.error(error);
            alert('Error creando usuario');
          }
        });

      return;
    }

    const usuarioActualizar = {
      idUsuarioExterno: user.idUsuarioExterno,
      nombre: user.nombre,
      correo: user.correo,
      notas: user.notas,
      estado: user.estado
    };

    this.externalUsersService
      .actualizarUsuario(usuarioActualizar)
      .subscribe({
        next: () => {

          this.isModalOpen = false;

          this.cargarUsuarios();

          alert('Usuario actualizado correctamente');
        },
        error: (error) => {
          console.error(error);
          alert('Error actualizando usuario');
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}