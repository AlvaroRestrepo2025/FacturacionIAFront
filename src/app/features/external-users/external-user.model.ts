export interface ExternalUser {
  idUsuarioExterno: number;
  nombre: string;
  correo: string;
  notas: string;
  usuarioCreacion: string;
  fechaCreacion: Date;
  usuarioModificacion: string;
  fechaModificacion: Date | null;
  estado: boolean;
}