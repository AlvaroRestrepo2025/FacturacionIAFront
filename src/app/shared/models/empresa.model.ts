export interface Empresa {
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
  usuarioCreacion: string;
  fechaCreacion: string;
  usuarioModificacion?: string | null;
  fechaModificacion?: string | null;
  estado: boolean;
  totalRegistros: number;
}