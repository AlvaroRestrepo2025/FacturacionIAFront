export interface LoginRequest {
  Credenciales: {
    Usuario: string;
    Contrasena: string;
  };
}

export interface Usuario {

  Nombre: string;
  Apellido: string;
  Correo: string;
  Cargo: string;
  Descripcion: string;
  EstadoCuenta: string;
}

export interface ResultadoOperacion {

  Mensaje: {
    Codigo: number;
    Tipo: number;
    Texto: string;
    Valor: string;
  };

  Respuesta: boolean;

  Resultado: Usuario[];

  JWT: string | null;
}