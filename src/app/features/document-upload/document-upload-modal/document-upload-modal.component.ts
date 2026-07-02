import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-document-upload-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './document-upload-modal.component.html',
  styleUrl: './document-upload-modal.component.css'
})
export class DocumentUploadModalComponent implements OnInit {

  @Input()
  mode: 'crear' | 'editar' = 'crear';

  @Input()
  document: any = null;

  @Input()
  isSaving = false;

  @Output()
  closeModal = new EventEmitter<void>();

  @Output()
  saveModal = new EventEmitter<any>();

  form = {

    nit: '',

    empresa: '',

    estado: 'Activo'

  };

  documentosAdjuntos: File[] = [];

  errors = {

    nit: '',

    empresa: '',

    archivos: ''

  };

  ngOnInit(): void {

    if (this.mode === 'editar' && this.document) {

      this.form.nit = this.document.nit;

      this.form.empresa = this.document.empresa;

      this.form.estado = this.document.estado;

    }

  }

  get title(): string {

    return this.mode === 'crear'

      ? 'Cargar documentos'

      : 'Editar documentos';

  }

  seleccionarArchivos(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {

      return;

    }

    const archivos = Array.from(input.files);

    for (const archivo of archivos) {

      if (this.validarArchivo(archivo)) {

        this.documentosAdjuntos.push(archivo);

      }

    }

    input.value = '';

  }

  eliminarAdjunto(index: number): void {

    this.documentosAdjuntos.splice(index, 1);

  }

  validarArchivo(file: File): boolean {

    if (!file.name.toLowerCase().endsWith('.pdf')) {

      alert(`El archivo "${file.name}" no es un PDF.`);

      return false;

    }

    if (file.size > 20 * 1024 * 1024) {

      alert(`El archivo "${file.name}" supera los 20 MB permitidos.`);

      return false;

    }

    const total =

      this.documentosAdjuntos.reduce(

        (s, x) => s + x.size,

        0

      ) + file.size;

    if (total > 100 * 1024 * 1024) {

      alert(

        'El tamaño total de la carga no puede superar 100 MB.'

      );

      return false;

    }

    return true;

  }

  validate(): boolean {

    let valid = true;

    this.errors = {

      nit: '',

      empresa: '',

      archivos: ''

    };

    if (!this.form.nit.trim()) {

      this.errors.nit =

        'El NIT es obligatorio.';

      valid = false;

    }

    if (!this.form.empresa.trim()) {

      this.errors.empresa =

        'La empresa es obligatoria.';

      valid = false;

    }

    if (

      this.mode === 'crear' &&

      this.documentosAdjuntos.length === 0

    ) {

      this.errors.archivos =

        'Debe seleccionar al menos un documento PDF.';

      valid = false;

    }

    return valid;

  }

  onAceptar(): void {

    if (this.isSaving) {

      return;

    }

    if (!this.validate()) {

      return;

    }

    this.saveModal.emit({

      nit: this.form.nit.trim(),

      empresa: this.form.empresa.trim(),

      estado: this.form.estado,

      archivos: this.documentosAdjuntos

    });

  }

  onCancelar(): void {

    this.closeModal.emit();

  }

}