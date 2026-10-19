export interface CredencialesLogin {
  email: string;
  password: string;
}

export interface UsuarioAutenticado {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  token: string;
}

export interface RespuestaAutenticacion {
  exito: boolean;
  mensaje?: string;
  usuario?: UsuarioAutenticado;
  token?: string
};

export interface RespuestaLoginApi {
  token: string;
  usuario: {
    id_usuario: number;
    nombre: string;
    apellido: string;
    email: string;
    rol: string;
    estado: boolean;
  };
}

export interface DatosUsuarioApi {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  estado: boolean;
}

