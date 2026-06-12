export interface ExternalUser {
  id: number;
  nombre: string;
  correo: string;
  notas: string;
  usuarioCreacion: string;
  fechaCreacion: Date;
  usuarioModificacion: string;
  fechaModificacion: Date | null;
  estado: 'Activo' | 'Inactivo';
}