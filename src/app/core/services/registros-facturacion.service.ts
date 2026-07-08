import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { RegistroFacturacionListadoResponse } from '../../shared/models/registro-facturacion-listado-response.model';
import { RegistroFacturacionExportarResponse } from '../../shared/models/registro-facturacion-exportar-response.model';
import { ExportarRegistrosFacturacionRequest } from '../../shared/models/exportar-registros-facturacion-request.model';

@Injectable({
  providedIn: 'root'
})
export class RegistroFacturacionService {

  private readonly http = inject(HttpClient);

  private readonly registrosFacturacionUrl =
    `${environment.apiUrl}/registros-facturacion`;

  listarRegistrosFacturacion(
    busqueda: string,
    estado: string,
    fechaInicio: string,
    fechaFin: string,
    pagina: number,
    cantidadRegistros: number
  ): Observable<RegistroFacturacionListadoResponse> {

    let params = new HttpParams()
      .set('pagina', pagina)
      .set('cantidadRegistros', cantidadRegistros);

    if (busqueda.trim() !== '') {
      params = params.set('busqueda', busqueda.trim());
    }

    if (estado.trim() !== '') {
      params = params.set('estado', estado.trim());
    }

    if (fechaInicio.trim() !== '') {
      params = params.set('fechaInicio', fechaInicio);
    }

    if (fechaFin.trim() !== '') {
      params = params.set('fechaFin', fechaFin);
    }

    return this.http.get<RegistroFacturacionListadoResponse>(
      this.registrosFacturacionUrl,
      { params }
    );
  }

  exportarRegistrosFacturacion(
    request: ExportarRegistrosFacturacionRequest
  ): Observable<RegistroFacturacionExportarResponse> {

    return this.http.post<RegistroFacturacionExportarResponse>(
      `${this.registrosFacturacionUrl}/exportar`,
      request
    );
  }

}