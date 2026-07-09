import { RegistroFacturacion } from './registro-facturacion.model';

export interface RegistroFacturacionListadoResponse {
  exito: boolean;
  mensaje: string;
  registrosFacturacion: RegistroFacturacion[];
  totalRegistros: number;
  pagina: number;
  cantidadRegistros: number;
}