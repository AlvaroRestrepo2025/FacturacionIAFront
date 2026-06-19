import { Empresa } from './empresa.model';

export interface EmpresaListadoResponse {
  exito: boolean;
  mensaje: string;
  empresas: Empresa[];
  totalRegistros: number;
  pagina: number;
  cantidadRegistros: number;
}