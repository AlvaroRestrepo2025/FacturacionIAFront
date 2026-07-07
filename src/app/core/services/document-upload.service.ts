import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { EmpresaService } from './empresa.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentUploadService {

  private readonly api =
    'https://localhost:7066/api/Documentos';

  constructor(
    private http: HttpClient
  ) { }

  obtener(): Observable<any[]> {

    return this.http.get<any[]>(this.api);

  }

  crear(formData: FormData): Observable<any> {

    return this.http.post(this.api, formData);

  }

  actualizar(formData: FormData): Observable<any> {

    return this.http.put(this.api, formData);

  }

}