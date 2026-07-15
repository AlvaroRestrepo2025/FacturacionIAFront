import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Moneda } from '../../core/models/moneda.model';
import { AlertService } from '../../core/services/alert.service';
import { EmpresaService } from '../../core/services/empresa.service';
import { MonedaService } from '../../core/services/moneda.service';
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
  private readonly monedaService = inject(MonedaService);
  private readonly alert = inject(AlertService);
  private readonly router = inject(Router);

  empresas: Empresa[] = [];
  monedas: Moneda[] = [];

  busqueda = '';

  pagina = 1;
  cantidadRegistros = 10;
  totalRegistros = 0;

  cargando = false;
  cargandoMonedas = false;
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
    this.cargarMonedas();
    this.cargarEmpresas(false);
  }

  cargarMonedas(): void {
    this.cargandoMonedas = true;

    this.monedaService.listarMonedas().subscribe({
      next: (response) => {
        this.cargandoMonedas = false;

        if (response.exito) {
          this.monedas = response.monedas;

          if (!this.formularioEmpresa.moneda) {
            this.formularioEmpresa.moneda = this.obtenerMonedaPorDefecto();
          }

          return;
        }

        this.monedas = [];

        this.alert.warning(
          response.mensaje || 'No fue posible cargar las monedas.',
          'Advertencia'
        );
      },
      error: () => {
        this.cargandoMonedas = false;
        this.monedas = [];

        this.alert.error(
          'No fue posible cargar las monedas. Por favor, comunícate con el administrador.',
          'Error'
        );
      }
    });
  }

  cargarEmpresas(
    mostrarMensajeConsulta = false,
    tipoConsulta: 'buscar' | 'limpiar' = 'buscar'
  ): void {
    this.cargando = true;

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
        this.cargando = false;

        if (mostrarMensajeConsulta) {
          if (tipoConsulta === 'limpiar') {
            this.alert.info(
              'Se restableció el listado de empresas.',
              'Búsqueda limpiada'
            );

            return;
          }

          this.alert.info(
            response.mensaje || 'La consulta de empresas se realizó correctamente.',
            'Consulta realizada'
          );
        }
      },
      error: () => {
        this.empresas = [];
        this.totalRegistros = 0;
        this.cargando = false;

        this.alert.error(
          'No fue posible cargar las empresas. Por favor, comunícate con el administrador.',
          'Error'
        );
      }
    });
  }

  buscarEmpresas(mostrarMensaje: boolean = true): void {
    this.pagina = 1;
    this.cargarEmpresas(mostrarMensaje, 'buscar');
  }

  onSearchChange(): void {

    this.pagina = 1;

    this.buscarEmpresas(false);

  }

  limpiarBusqueda(): void {
    this.busqueda = '';
    this.pagina = 1;
    this.cargarEmpresas(true, 'limpiar');
  }

  paginaAnterior(): void {
    if (this.pagina <= 1) {
      return;
    }

    this.pagina--;
    this.cargarEmpresas(false);
  }

  paginaSiguiente(): void {
    if (!this.tienePaginaSiguiente) {
      return;
    }

    this.pagina++;
    this.cargarEmpresas(false);
  }

  abrirModalCrear(): void {
    this.modoFormulario = 'crear';
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
      moneda: this.obtenerMonedaPorDefecto(),
      estado: true
    };
  }

  abrirModalEditar(empresa: Empresa): void {
    this.modoFormulario = 'editar';
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
    this.guardando = false;
  }

  guardarEmpresa(): void {
    if (this.guardando) {
      return;
    }

    const errorValidacion = this.validarFormulario();

    if (errorValidacion) {
      this.alert.warning(
        errorValidacion,
        'Campos obligatorios'
      );

      return;
    }

    this.guardando = true;

    if (this.modoFormulario === 'crear') {
      this.crearEmpresa();
      return;
    }

    this.actualizarEmpresa();
  }

  private crearEmpresa(): void {
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

        if (response.exito) {
          this.mostrarModal = false;
          this.cargarEmpresas(false);

          this.alert.success(
            response.mensaje || 'La empresa fue creada correctamente.',
            'Empresa creada'
          );

          return;
        }

        this.alert.warning(
          response.mensaje || 'No fue posible crear la empresa.',
          'Advertencia'
        );
      },
      error: (error) => {
        this.guardando = false;

        this.alert.error(
          this.obtenerMensajeError(
            error,
            'No fue posible crear la empresa. Por favor, comunícate con el administrador.'
          ),
          'Error'
        );
      }
    });
  }

  private actualizarEmpresa(): void {
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

        if (response.exito) {
          this.mostrarModal = false;
          this.cargarEmpresas(false);

          this.alert.success(
            response.mensaje || 'Los cambios fueron guardados correctamente.',
            'Empresa actualizada'
          );

          return;
        }

        this.alert.warning(
          response.mensaje || 'No fue posible actualizar la empresa.',
          'Advertencia'
        );
      },
      error: (error) => {
        this.guardando = false;

        this.alert.error(
          this.obtenerMensajeError(
            error,
            'No fue posible actualizar la empresa. Por favor, comunícate con el administrador.'
          ),
          'Error'
        );
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

  private obtenerMonedaPorDefecto(): string {
    const monedaCop = this.monedas.find(
      moneda => moneda.moneda.toUpperCase() === 'COP'
    );

    if (monedaCop) {
      return monedaCop.moneda;
    }

    if (this.monedas.length > 0) {
      return this.monedas[0].moneda;
    }

    return 'COP';
  }

  private obtenerMensajeError(
    error: any,
    mensajePorDefecto: string
  ): string {
    if (error?.error?.mensaje) {
      return error.error.mensaje;
    }

    if (typeof error?.error === 'string') {
      return error.error;
    }

    return mensajePorDefecto;
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