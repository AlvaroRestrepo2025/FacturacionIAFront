import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExternalUser } from '../external-user.model';

@Component({
  selector: 'app-external-user-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './external-user-modal.component.html',
  styleUrl: './external-user-modal.component.css',
})
export class ExternalUserModalComponent implements OnInit {
  @Input() mode: 'crear' | 'editar' = 'crear';
  @Input() user: ExternalUser | null = null;

  @Output() closeModal = new EventEmitter<void>();
  @Output() saveModal = new EventEmitter<ExternalUser>();

  form = {
    nombre: '',
    correo: '',
    notas: '',
    estado: 'Activo' as 'Activo' | 'Inactivo',
  };

  errors = {
    nombre: '',
    correo: '',
    notas: '',
  };

  ngOnInit(): void {
    if (this.mode === 'editar' && this.user) {
      this.form.nombre = this.user.nombre;
      this.form.correo = this.user.correo;
      this.form.notas = this.user.notas;
      this.form.estado = this.user.estado;
    }
  }

  get title(): string {
    return this.mode === 'crear' ? 'Crear usuario externo' : 'Editar usuario externo';
  }

  validate(): boolean {
    let valid = true;
    this.errors = { nombre: '', correo: '', notas: '' };

    if (!this.form.nombre.trim()) {
      this.errors.nombre = 'El nombre es obligatorio.';
      valid = false;
    }

    if (!this.form.correo.trim()) {
      this.errors.correo = 'El correo es obligatorio.';
      valid = false;
    } else if (!this.isValidEmail(this.form.correo)) {
      this.errors.correo = 'El formato del correo no es válido.';
      valid = false;
    }

    if (!this.form.notas.trim()) {
      this.errors.notas = 'Las notas son obligatorias.';
      valid = false;
    }

    return valid;
  }

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  onAceptar(): void {
    if (!this.validate()) return;

    const saved: ExternalUser = {
      id: this.user?.id ?? 0,
      nombre: this.form.nombre.trim(),
      correo: this.form.correo.trim(),
      notas: this.form.notas.trim(),
      estado: this.form.estado,
      usuarioCreacion: this.user?.usuarioCreacion ?? '',
      fechaCreacion: this.user?.fechaCreacion ?? new Date(),
      usuarioModificacion: '',
      fechaModificacion: null,
    };

    this.saveModal.emit(saved);
  }

  onCancelar(): void {
    this.closeModal.emit();
  }
}