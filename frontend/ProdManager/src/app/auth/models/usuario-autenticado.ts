export interface CredencialesLogin {
  email: string;
  password: string;
}

export interface UsuarioAutenticado {
  id: string;
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

export interface UsuarioBD {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  contrasena: string;
  rol: string;
  estado: boolean;
}

