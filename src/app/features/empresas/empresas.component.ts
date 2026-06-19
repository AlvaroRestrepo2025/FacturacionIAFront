import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { EmpresaService } from '../../core/services/empresa.service';
import { ActualizarEmpresaRequest } from '../../shared/models/actualizar-empresa-request.model';
import { CrearEmpresaRequest } from '../../shared/models/crear-empresa-request.model';
import { Empresa } from '../../shared/models/empresa.model';

@Component({
  selector: 'app-empresas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './empresas.component.html',
  styleUrl: './empresas.component.css'
})
export class EmpresasComponent implements OnInit {
  private readonly empresaService = inject(EmpresaService);
  private readonly router = inject(Router);

  empresas: Empresa[] = [];

  busqueda = '';
  mensaje = '';
  mensajeFormulario = '';

  pagina = 1;
  cantidadRegistros = 10;
  totalRegistros = 0;

  cargando = false;
  guardando = false;

  mostrarModal = false;
  modoFormulario: 'crear' | 'editar' = 'crear';

  formularioEmpresa = {
    idEmpresa: 0,
    nit: '',
    razonSocial: '',
    direccion: '',
    cliente: '',
    telefono: '',
    comercialPositivo: '',
    supervisor: '',
    cr: '',
    ciudad: '',
    moneda: 'COP',
    estado: true
  };

  ngOnInit(): void {
    this.cargarEmpresas();
  }

  cargarEmpresas(): void {
    this.cargando = true;
    this.mensaje = '';

    this.empresaService.listarEmpresas(
      this.busqueda,
      this.pagina,
      this.cantidadRegistros
    ).subscribe({
      next: (response) => {
        this.empresas = response.empresas;
        this.totalRegistros = response.totalRegistros;
        this.pagina = response.pagina;
        this.cantidadRegistros = response.cantidadRegistros;
        this.mensaje = response.mensaje;
        this.cargando = false;
      },
      error: () => {
        this.empresas = [];
        this.totalRegistros = 0;
        this.mensaje = 'No fue posible cargar las empresas. Verifica que el backend esté en ejecución.';
        this.cargando = false;
      }
    });
  }

  buscarEmpresas(): void {
    this.pagina = 1;
    this.cargarEmpresas();
  }

  limpiarBusqueda(): void {
    this.busqueda = '';
    this.pagina = 1;
    this.cargarEmpresas();
  }

  paginaAnterior(): void {
    if (this.pagina <= 1) {
      return;
    }

    this.pagina--;
    this.cargarEmpresas();
  }

  paginaSiguiente(): void {
    if (!this.tienePaginaSiguiente) {
      return;
    }

    this.pagina++;
    this.cargarEmpresas();
  }

  abrirModalCrear(): void {
    this.modoFormulario = 'crear';
    this.mensajeFormulario = '';
    this.mostrarModal = true;

    this.formularioEmpresa = {
      idEmpresa: 0,
      nit: '',
      razonSocial: '',
      direccion: '',
      cliente: '',
      telefono: '',
      comercialPositivo: '',
      supervisor: '',
      cr: '',
      ciudad: '',
      moneda: 'COP',
      estado: true
    };
  }

  abrirModalEditar(empresa: Empresa): void {
    this.modoFormulario = 'editar';
    this.mensajeFormulario = '';
    this.mostrarModal = true;

    this.formularioEmpresa = {
      idEmpresa: empresa.idEmpresa,
      nit: empresa.nit,
      razonSocial: empresa.razonSocial,
      direccion: empresa.direccion,
      cliente: empresa.cliente,
      telefono: empresa.telefono,
      comercialPositivo: empresa.comercialPositivo,
      supervisor: empresa.supervisor,
      cr: empresa.cr,
      ciudad: empresa.ciudad,
      moneda: empresa.moneda,
      estado: empresa.estado
    };
  }

  cancelarModal(): void {
    this.mostrarModal = false;
    this.mensajeFormulario = '';
    this.guardando = false;
  }

  guardarEmpresa(): void {
    const errorValidacion = this.validarFormulario();

    if (errorValidacion) {
      this.mensajeFormulario = errorValidacion;
      return;
    }

    this.guardando = true;
    this.mensajeFormulario = '';

    if (this.modoFormulario === 'crear') {
      const request: CrearEmpresaRequest = {
        nit: this.formularioEmpresa.nit.trim(),
        razonSocial: this.formularioEmpresa.razonSocial.trim(),
        direccion: this.formularioEmpresa.direccion.trim(),
        cliente: this.formularioEmpresa.cliente.trim(),
        telefono: this.formularioEmpresa.telefono.trim(),
        comercialPositivo: this.formularioEmpresa.comercialPositivo.trim(),
        supervisor: this.formularioEmpresa.supervisor.trim(),
        cr: this.formularioEmpresa.cr.trim(),
        ciudad: this.formularioEmpresa.ciudad.trim(),
        moneda: this.formularioEmpresa.moneda.trim(),
        usuarioCreacion: 'UsuarioTemporalHU005'
      };

      this.empresaService.crearEmpresa(request).subscribe({
        next: (response) => {
          this.guardando = false;
          this.mensajeFormulario = response.mensaje;

          if (response.exito) {
            this.mostrarModal = false;
            this.cargarEmpresas();
          }
        },
        error: () => {
          this.guardando = false;
          this.mensajeFormulario = 'No fue posible crear la empresa. Verifica que el backend esté en ejecución.';
        }
      });

      return;
    }

    const request: ActualizarEmpresaRequest = {
      idEmpresa: this.formularioEmpresa.idEmpresa,
      nit: this.formularioEmpresa.nit.trim(),
      razonSocial: this.formularioEmpresa.razonSocial.trim(),
      direccion: this.formularioEmpresa.direccion.trim(),
      cliente: this.formularioEmpresa.cliente.trim(),
      telefono: this.formularioEmpresa.telefono.trim(),
      comercialPositivo: this.formularioEmpresa.comercialPositivo.trim(),
      supervisor: this.formularioEmpresa.supervisor.trim(),
      cr: this.formularioEmpresa.cr.trim(),
      ciudad: this.formularioEmpresa.ciudad.trim(),
      moneda: this.formularioEmpresa.moneda.trim(),
      estado: this.formularioEmpresa.estado,
      usuarioModificacion: 'UsuarioTemporalHU005'
    };

    this.empresaService.actualizarEmpresa(
      this.formularioEmpresa.idEmpresa,
      request
    ).subscribe({
      next: (response) => {
        this.guardando = false;
        this.mensajeFormulario = response.mensaje;

        if (response.exito) {
          this.mostrarModal = false;
          this.cargarEmpresas();
        }
      },
      error: () => {
        this.guardando = false;
        this.mensajeFormulario = 'No fue posible actualizar la empresa. Verifica que el backend esté en ejecución.';
      }
    });
  }

  private validarFormulario(): string | null {
    if (this.formularioEmpresa.nit.trim() === '') {
      return 'El NIT es obligatorio.';
    }

    if (this.formularioEmpresa.razonSocial.trim() === '') {
      return 'La razón social es obligatoria.';
    }

    if (this.formularioEmpresa.direccion.trim() === '') {
      return 'La dirección es obligatoria.';
    }

    if (this.formularioEmpresa.cliente.trim() === '') {
      return 'El cliente es obligatorio.';
    }

    if (this.formularioEmpresa.telefono.trim() === '') {
      return 'El teléfono es obligatorio.';
    }

    if (this.formularioEmpresa.comercialPositivo.trim() === '') {
      return 'El comercial Positivo es obligatorio.';
    }

    if (this.formularioEmpresa.supervisor.trim() === '') {
      return 'El supervisor es obligatorio.';
    }

    if (this.formularioEmpresa.cr.trim() === '') {
      return 'El CR es obligatorio.';
    }

    if (this.formularioEmpresa.ciudad.trim() === '') {
      return 'La ciudad es obligatoria.';
    }

    if (this.formularioEmpresa.moneda.trim() === '') {
      return 'La moneda es obligatoria.';
    }

    return null;
  }

  get tienePaginaSiguiente(): boolean {
    return this.pagina * this.cantidadRegistros < this.totalRegistros;
  }

  get totalPaginas(): number {
    if (this.totalRegistros === 0) {
      return 1;
    }

    return Math.ceil(this.totalRegistros / this.cantidadRegistros);
  }

  obtenerTextoEstado(estado: boolean): string {
    return estado ? 'Activo' : 'Inactivo';
  }

  volverAlPanelPrincipal(): void {
    void this.router.navigateByUrl('/dashboard');
  }
}