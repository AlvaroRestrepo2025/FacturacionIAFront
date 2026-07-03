import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { DocumentUploadModalComponent } from '../document-upload-modal/document-upload-modal.component';
import { DocumentUploadService } from '../../../core/services/document-upload.service';

import { EmpresaService } from '../../../core/services/empresa.service';
import { Empresa } from '../../../shared/models/empresa.model';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-document-upload-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DocumentUploadModalComponent
  ],
  templateUrl: './document-upload-list.component.html',
  styleUrl: './document-upload-list.component.css'
})
export class DocumentUploadListComponent implements OnInit {

  searchText = '';

  currentPage = 1;

  pageSize = 10;

  isSaving = false;

  isModalOpen = false;

  modalMode: 'crear' | 'editar' = 'crear';

  selectedDocument: any = null;

  documents: any[] = [];

  empresas: Empresa[] = [];

  constructor(
    private router: Router,
    private documentService: DocumentUploadService,
    private empresaService: EmpresaService,
    private alert: AlertService
  ) { }

  ngOnInit(): void {

    this.obtenerDocumentos();
    this.obtenerEmpresas();

  }

  obtenerEmpresas(): void {

    this.empresaService
      .listarEmpresas('', 1, 1000)
      .subscribe({

        next: (response) => {

          this.empresas = response.empresas;

        },

        error: (err) => {

          console.error(err);

        }

      });

  }

  obtenerDocumentos(): void {

    this.documentService.obtener()
      .subscribe({

        next: (data: any[]) => {

          this.documents = data;

        },

        error: (err: any) => {

          console.error(err);

        }

      });

  }

  get filteredDocuments() {

    const term = this.searchText.toLowerCase().trim();

    if (!term) {

      return this.documents;

    }

    return this.documents.filter(x =>

      x.nit?.toLowerCase().includes(term) ||

      x.empresa?.toLowerCase().includes(term)

    );

  }

  get pagedDocuments() {

    const start = (this.currentPage - 1) * this.pageSize;

    return this.filteredDocuments.slice(

      start,

      start + this.pageSize

    );

  }

  get totalPages() {

    return Math.ceil(

      this.filteredDocuments.length / this.pageSize

    ) || 1;

  }

  get pages() {

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

    this.selectedDocument = null;

    this.isModalOpen = true;

    console.log('Crear');

  }

  openEditarModal(document: any): void {

    this.modalMode = 'editar';

    this.selectedDocument = { ...document };

    this.isModalOpen = true;

  }

  onModalClose(): void {

    this.isModalOpen = false;

    this.selectedDocument = null;

    this.isSaving = false;

  }

  onModalSave(document: any): void {

    this.isSaving = true;

    const formData = new FormData();

    const nombreUsuario =
      `${sessionStorage.getItem('Nombre') ?? ''} ${sessionStorage.getItem('Apellido') ?? ''}`.trim();

    formData.append(
      'IdEmpresa',
      document.idEmpresa.toString()
    );

    if (this.modalMode === 'editar') {

      formData.append(
        'IdSolicitud',
        this.selectedDocument.idSolicitud.toString()
      );

      formData.append(
        'Estado',
        document.estado
      );

      formData.append(
        'UsuarioModificacion',
        nombreUsuario
      );
    }
    else {

      formData.append(
        'UsuarioRegistro',
        nombreUsuario
      );
    }

    for (const archivo of document.archivos) {

      formData.append(
        'Archivos',
        archivo
      );

    }

    if (this.modalMode === 'crear') {

      this.documentService.crear(formData)
        .subscribe({

          next: () => {

            this.obtenerDocumentos();

            this.onModalClose();

            this.isSaving = false;

            this.alert.success(
              'Los documentos fueron cargados correctamente.',
              'Documento creado'
            );

          },

          error: (err: any) => {

            this.isSaving = false;

            this.alert.error(
              err?.error?.mensaje ??
              err?.error ??
              'Ocurrió un error al guardar el documento.',
              'Error'
            );

          }

        });

    }
    else {

      this.documentService.actualizar(formData)
        .subscribe({

          next: () => {

            this.obtenerDocumentos();

            this.onModalClose();

            this.isSaving = false;

            this.alert.success(
              'Los cambios fueron guardados correctamente.',
              'Documento actualizado'
            );

          },

          error: (err: any) => {

            console.error(err);

            this.isSaving = false;

            this.alert.error(
              err?.error?.mensaje ??
              err?.error ??
              'Ocurrió un error al actualizar el documento.',
              'Error'
            );

          }

        });

    }

  }

  procesar(document: any): void {

    console.log(document);

  }

  goBack(): void {

    this.router.navigate(['/dashboard']);

  }

}