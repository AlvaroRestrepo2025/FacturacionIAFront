import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { ActualizarEmpresaRequest } from '../../shared/models/actualizar-empresa-request.model';
import { CrearEmpresaRequest } from '../../shared/models/crear-empresa-request.model';
import { EmpresaGuardarResponse } from '../../shared/models/empresa-guardar-response.model';
import { EmpresaListadoResponse } from '../../shared/models/empresa-listado-response.model';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  private readonly http = inject(HttpClient);

  private readonly empresasUrl = `${environment.apiUrl}/empresas`;

  listarEmpresas(
    busqueda: string,
    pagina: number,
    cantidadRegistros: number
  ): Observable<EmpresaListadoResponse> {
    let params = new HttpParams()
      .set('pagina', pagina)
      .set('cantidadRegistros', cantidadRegistros);

    if (busqueda.trim() !== '') {
      params = params.set('busqueda', busqueda.trim());
    }

    return this.http.get<EmpresaListadoResponse>(
      this.empresasUrl,
      { params }
    );
  }

  crearEmpresa(
    request: CrearEmpresaRequest
  ): Observable<EmpresaGuardarResponse> {
    return this.http.post<EmpresaGuardarResponse>(
      this.empresasUrl,
      request
    );
  }

  actualizarEmpresa(
    idEmpresa: number,
    request: ActualizarEmpresaRequest
  ): Observable<EmpresaGuardarResponse> {
    return this.http.put<EmpresaGuardarResponse>(
      `${this.empresasUrl}/${idEmpresa}`,
      request
    );
  }
}
