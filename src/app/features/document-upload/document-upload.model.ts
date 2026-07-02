export interface DocumentUpload {

  idSolicitud: number;

  identificador: string;

  nit: string;

  empresa: string;

  cantidadArchivos: number;

  usuarioCreacion: string;

  fechaCreacion: Date;

  usuarioModificacion?: string;

  fechaModificacion?: Date;

  estado: string;

}