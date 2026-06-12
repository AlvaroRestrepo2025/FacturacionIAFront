import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ExternalUserModalComponent } from '../external-user-modal/external-user-modal.component';
import { ExternalUser } from '../external-user.model';

@Component({
  selector: 'app-external-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ExternalUserModalComponent],
  templateUrl: './external-users-list.component.html',
  styleUrl: './external-users-list.component.css',
})
export class ExternalUsersListComponent implements OnInit {
  users: ExternalUser[] = [
    {
      id: 1,
      nombre: 'Carlos Ramírez',
      correo: 'carlos.ramirez@contabler.com',
      notas: 'Usuario de prueba',
      usuarioCreacion: 'admin',
      fechaCreacion: new Date('2025-01-10'),
      usuarioModificacion: '',
      fechaModificacion: null,
      estado: 'Activo',
    },
    {
      id: 2,
      nombre: 'Laura Gómez',
      correo: 'laura.gomez@contabler.com',
      notas: 'Acceso contabilidad',
      usuarioCreacion: 'admin',
      fechaCreacion: new Date('2025-02-14'),
      usuarioModificacion: 'admin',
      fechaModificacion: new Date('2025-03-01'),
      estado: 'Inactivo',
    },
  ];

  searchText = '';
  currentPage = 1;
  pageSize = 10;

  isModalOpen = false;
  modalMode: 'crear' | 'editar' = 'crear';
  selectedUser: ExternalUser | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {}

  get filteredUsers(): ExternalUser[] {
    const term = this.searchText.toLowerCase().trim();
    if (!term) return this.users;
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
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
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

  onModalSave(user: ExternalUser): void {
    if (this.modalMode === 'crear') {
      const newUser: ExternalUser = {
        ...user,
        id: this.users.length + 1,
        usuarioCreacion: 'admin',
        fechaCreacion: new Date(),
        usuarioModificacion: '',
        fechaModificacion: null,
        estado: 'Activo',
      };
      this.users = [...this.users, newUser];
    } else {
      this.users = this.users.map((u) =>
        u.id === user.id
          ? {
              ...user,
              usuarioModificacion: 'admin',
              fechaModificacion: new Date(),
            }
          : u
      );
    }
    this.isModalOpen = false;
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}