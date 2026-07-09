export interface RegistroFacturacion {
  idRegistroFacturacion: number;
  numeroRegistro: string;
  fechaCreacion: string;
  razonSocial: string;
  ciudad: string;
  descripcion: string;
  valor: number;
  estado: string;
  moneda?: string;
  totalRegistros?: number;
}