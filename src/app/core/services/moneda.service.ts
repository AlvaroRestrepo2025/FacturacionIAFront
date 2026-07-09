import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { MonedaListadoResponse } from '../models/moneda.model';

@Injectable({
  providedIn: 'root'
})
export class MonedaService {
  private readonly apiUrl = `${environment.apiUrl}/monedas`;

  constructor(private http: HttpClient) {}

  listarMonedas(): Observable<MonedaListadoResponse> {
    return this.http.get<MonedaListadoResponse>(this.apiUrl);
  }
}