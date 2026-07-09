export interface Moneda {
  idMoneda: number;
  moneda: string;
  usuarioRegistro: string;
  fechaRegistro: string;
  usuarioModificacion?: string | null;
  fechaModificacion?: string | null;
  estado: boolean;
}

export interface MonedaListadoResponse {
  exito: boolean;
  mensaje: string;
  monedas: Moneda[];
}