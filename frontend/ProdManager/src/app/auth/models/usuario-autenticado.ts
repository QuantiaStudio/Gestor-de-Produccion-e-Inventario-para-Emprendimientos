export interface CredencialesLogin {
  email: string;
  password: string;
}

export interface UsuarioAutenticado {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  token: string;
}

export interface RespuestaAutenticacion {
  exito: boolean;
  mensaje?: string;
  usuario?: UsuarioAutenticado;
  token?: string;
}
