export interface ActualizarEmpresaRequest {
  idEmpresa: number;
  nit: string;
  razonSocial: string;
  direccion: string;
  cliente: string;
  telefono: string;
  comercialPositivo: string;
  supervisor: string;
  cr: string;
  ciudad: string;
  moneda: string;
  estado: boolean;
  usuarioModificacion: string;
}