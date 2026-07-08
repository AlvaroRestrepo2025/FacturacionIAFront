import { RegistroFacturacion } from './registro-facturacion.model';

export interface RegistroFacturacionExportarResponse {
  exito: boolean;
  mensaje: string;
  registrosFacturacion: RegistroFacturacion[];
}