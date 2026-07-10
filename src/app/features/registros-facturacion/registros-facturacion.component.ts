import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import { AlertService } from '../../core/services/alert.service';
import { RegistroFacturacionService } from '../../core/services/registros-facturacion.service';
import { ExportarRegistrosFacturacionRequest } from '../../shared/models/exportar-registros-facturacion-request.model';
import { RegistroFacturacion } from '../../shared/models/registro-facturacion.model';
import { RegistroFacturacionExportarResponse } from '../../shared/models/registro-facturacion-exportar-response.model';
import { RegistroFacturacionListadoResponse } from '../../shared/models/registro-facturacion-listado-response.model';

@Component({
  selector: 'app-registros-facturacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registros-facturacion.component.html',
  styleUrl: './registros-facturacion.component.css'
})
export class RegistrosFacturacionComponent implements OnInit, AfterViewInit {
  private readonly registrosService = inject(RegistroFacturacionService);
  private readonly alert = inject(AlertService);
  private readonly router = inject(Router);

  @ViewChild('checkboxSeleccionTodos')
  checkboxSeleccionTodos?: ElementRef<HTMLInputElement>;

  registros: RegistroFacturacion[] = [];

  busqueda = '';
  estado = '';
  fechaInicio = '';
  fechaFin = '';

  mensaje = '';
  cargando = false;

  pagina = 1;
  cantidadRegistros = 10;
  totalRegistros = 0;

  seleccionados: number[] = [];

  ordenNumero: 'asc' | 'desc' = 'asc';

  ngOnInit(): void {
    this.consultar(false);
  }

  ngAfterViewInit(): void {
    this.actualizarEstadoCheckboxPrincipal();
  }

  consultar(
    mostrarMensajeConsulta = true,
    tipoConsulta: 'consultar' | 'limpiar' = 'consultar'
  ): void {
    this.cargando = true;
    this.limpiarMensaje();
    this.limpiarSeleccionInterna();

    this.registrosService
      .listarRegistrosFacturacion(
        this.busqueda.trim(),
        this.estado,
        this.fechaInicio || '',
        this.fechaFin || '',
        this.pagina,
        this.cantidadRegistros
      )
      .subscribe({
        next: (response: RegistroFacturacionListadoResponse) => {
          this.registros = response?.registrosFacturacion ?? [];
          this.totalRegistros = response?.totalRegistros ?? 0;
          this.pagina = response?.pagina ?? this.pagina;
          this.cantidadRegistros =
            response?.cantidadRegistros ?? this.cantidadRegistros;
          this.cargando = false;

          this.mensaje =
            response?.mensaje ||
            (
              this.registros.length === 0
                ? 'No hay registros para mostrar.'
                : ''
            );

          if (mostrarMensajeConsulta) {
            if (tipoConsulta === 'limpiar') {
              this.alert.info(
                'Se restableció el listado de registros de facturación.',
                'Filtros limpiados'
              );
            } else {
              this.alert.info(
                response?.mensaje ||
                  'La consulta de registros de facturación se realizó correctamente.',
                'Consulta realizada'
              );
            }
          }

          setTimeout(() => this.actualizarEstadoCheckboxPrincipal());
        },
        error: (error) => {
          this.registros = [];
          this.totalRegistros = 0;
          this.cargando = false;

          this.mensaje =
            'No fue posible consultar los registros de facturación.';

          this.alert.error(
            this.obtenerMensajeError(
              error,
              'No fue posible consultar los registros de facturación. Por favor, comunícate con el administrador.'
            ),
            'Error'
          );

          setTimeout(() => this.actualizarEstadoCheckboxPrincipal());
        }
      });
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.estado = '';
    this.fechaInicio = '';
    this.fechaFin = '';
    this.pagina = 1;
    this.consultar(true, 'limpiar');
  }

  paginaAnterior(): void {
    if (this.pagina <= 1 || this.cargando) {
      return;
    }

    this.pagina--;
    this.consultar(false);
  }

  paginaSiguiente(): void {
    if (!this.tienePaginaSiguiente || this.cargando) {
      return;
    }

    this.pagina++;
    this.consultar(false);
  }

  toggleSeleccion(idRegistroFacturacion: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      if (!this.seleccionados.includes(idRegistroFacturacion)) {
        this.seleccionados.push(idRegistroFacturacion);
      }
    } else {
      this.seleccionados = this.seleccionados.filter(
        (id) => id !== idRegistroFacturacion
      );
    }

    this.actualizarEstadoCheckboxPrincipal();
  }

  toggleSeleccionTodos(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    if (checked) {
      this.seleccionados = this.registros.map(
        (registro) => registro.idRegistroFacturacion
      );
    } else {
      this.seleccionados = [];
    }

    this.actualizarEstadoCheckboxPrincipal();
  }

  estaSeleccionado(idRegistroFacturacion: number): boolean {
    return this.seleccionados.includes(idRegistroFacturacion);
  }

  todosSeleccionados(): boolean {
    if (this.registros.length === 0) {
      return false;
    }

    return this.registros.every((registro) =>
      this.seleccionados.includes(registro.idRegistroFacturacion)
    );
  }

  haySeleccionParcial(): boolean {
    return (
      this.registros.length > 0 &&
      this.seleccionados.length > 0 &&
      this.seleccionados.length < this.registros.length
    );
  }

  actualizarEstadoCheckboxPrincipal(): void {
    if (!this.checkboxSeleccionTodos?.nativeElement) {
      return;
    }

    this.checkboxSeleccionTodos.nativeElement.indeterminate =
      this.haySeleccionParcial();
  }

  ordenarPorNumero(): void {
    if (this.registros.length === 0) {
      return;
    }

    this.ordenNumero = this.ordenNumero === 'asc' ? 'desc' : 'asc';

    this.registros = [...this.registros].sort((a, b) => {
      const numeroA = a.numeroRegistro ?? '';
      const numeroB = b.numeroRegistro ?? '';

      return this.ordenNumero === 'asc'
        ? numeroA.localeCompare(numeroB, undefined, {
            numeric: true,
            sensitivity: 'base'
          })
        : numeroB.localeCompare(numeroA, undefined, {
            numeric: true,
            sensitivity: 'base'
          });
    });
  }

  obtenerIndicadorOrdenNumero(): string {
    return this.ordenNumero === 'asc' ? '▲' : '▼';
  }

  obtenerValorConMoneda(valor: number, moneda?: string): string {
    const tipoMoneda = (moneda ?? 'COP').trim().toUpperCase();

    const valorFormateado = new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Number(valor ?? 0));

    return `${tipoMoneda} $ ${valorFormateado}`;
  }

  obtenerClaseEstado(estado: string): string {
    const valor = (estado ?? '').trim().toUpperCase();

    switch (valor) {
      case 'ACTIVO':
        return 'status-activo';
      case 'INACTIVO':
        return 'status-inactivo';
      case 'PROCESADO':
        return 'status-procesado';
      case 'FACTURADO':
        return 'status-facturado';
      case 'INCONSISTENCIA':
        return 'status-inconsistencia';
      default:
        return 'status-inactivo';
    }
  }

  exportarSeleccionados(): void {
    if (this.seleccionados.length === 0) {
      this.alert.warning(
        'Debe seleccionar al menos un registro.',
        'Exportación de registros'
      );
      return;
    }

    const request: ExportarRegistrosFacturacionRequest = {
      idsRegistros: this.seleccionados
    };

    this.registrosService.exportarRegistrosFacturacion(request).subscribe({
      next: (response: RegistroFacturacionExportarResponse) => {
        const registrosExportar = response?.registrosFacturacion ?? [];

        if (!response?.exito || registrosExportar.length === 0) {
          this.alert.warning(
            response?.mensaje || 'No se encontraron registros para exportar.',
            'Exportación de registros'
          );
          return;
        }

        const dataExcel = registrosExportar.map(
          (registro: RegistroFacturacion) => ({
            'Número de registro': registro.numeroRegistro,
            'Fecha de creación': registro.fechaCreacion,
            'Razón social': registro.razonSocial,
            Ciudad: registro.ciudad,
            Descripción: registro.descripcion,
            Valor: this.obtenerValorConMoneda(
              registro.valor,
              registro.moneda
            ),
            Estado: registro.estado
          })
        );

        const worksheet = XLSX.utils.json_to_sheet(dataExcel);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
          workbook,
          worksheet,
          'RegistrosFacturacion'
        );

        const excelBuffer = XLSX.write(workbook, {
          bookType: 'xlsx',
          type: 'array'
        });

        const blob = new Blob([excelBuffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        const fecha = new Date();
        const fechaTexto =
          `${fecha.getFullYear()}${(fecha.getMonth() + 1)
            .toString()
            .padStart(2, '0')}${fecha.getDate().toString().padStart(2, '0')}_` +
          `${fecha.getHours().toString().padStart(2, '0')}${fecha
            .getMinutes()
            .toString()
            .padStart(2, '0')}${fecha
            .getSeconds()
            .toString()
            .padStart(2, '0')}`;

        saveAs(blob, `RegistrosFacturacion_${fechaTexto}.xlsx`);

        this.alert.success(
          'El archivo Excel fue generado correctamente.',
          'Exportación realizada'
        );
      },
      error: (error) => {
        this.alert.error(
          this.obtenerMensajeError(
            error,
            'No fue posible obtener los registros para exportación. Por favor, comunícate con el administrador.'
          ),
          'Error'
        );
      }
    });
  }

  private limpiarMensaje(): void {
    this.mensaje = '';
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

  volverAlPanelPrincipal(): void {
    void this.router.navigateByUrl('/dashboard');
  }

  private limpiarSeleccionInterna(): void {
    this.seleccionados = [];
    this.actualizarEstadoCheckboxPrincipal();
  }
}