import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, from, of,} from 'rxjs';
import { map } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { CredencialesLogin, RespuestaAutenticacion, UsuarioAutenticado, UsuarioBD} from '../models/usuario-autenticado';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  private apiUrl = 'http://localhost:3000/usuarios'

  private usuarioSubject = new BehaviorSubject<UsuarioAutenticado | null>(
    this.obtenerUsuarioDeStorage()
  );

  public usuario$ = this.usuarioSubject.asObservable();

  constructor(private http: HttpClient){}

  login(credenciales: CredencialesLogin): Observable<RespuestaAutenticacion> {
    const url = `${this.apiUrl}?email=${credenciales.email}&contrasena=${credenciales.password}`;
    console.log('URL enviada:', url);
    return this.http.get<any[]>(url).pipe(
    map(usuarios => {
      console.log('Usuarios recibidos:', usuarios);
      if (usuarios && usuarios.length > 0) {
        const usuarioDb = usuarios[0]
        
        if (usuarioDb.estado === false){
          return {
            exito:false,
            mensaje: 'El usuario se encuentra inactivo. Contacta a un administrador.'
          }
        }

        const usuarioAutenticado: UsuarioAutenticado = {
          id: usuarioDb.id || usuarioDb.id_usuario,
          nombre: usuarioDb.nombre,
          apellido:usuarioDb.apellido,
          email: usuarioDb.email,
          rol: usuarioDb.rol,
          token: 'token-simulado-json-server-123'
          }
        const respuestaExito: RespuestaAutenticacion = {
          exito: true,
          mensaje: 'Inicio de sesion exitoso',
          usuario:usuarioAutenticado,
          token:usuarioAutenticado.token
        };

        this.guardarSesion(respuestaExito.token!, respuestaExito.usuario!);
        return respuestaExito;
      }
      return {
        exito:false,
        mensaje: 'Credenciales invalidas. Verifica tu correo y contraseña.'
      };
    })
  );
}

  /**
   * Guarda la información necesaria para mantener
   * la sesión del usuario.
   */
  private guardarSesion(
    token: string,
    usuario: UsuarioAutenticado
  ): void {

    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(
      this.USER_KEY,
      JSON.stringify(usuario)
    );

    this.usuarioSubject.next(usuario);
  }

  /**
   * Recupera el usuario almacenado en localStorage.
   */
  private obtenerUsuarioDeStorage(): UsuarioAutenticado | null {

    const userStr = localStorage.getItem(this.USER_KEY);

    if (!userStr) {
      return null;
    }

    try {
      return JSON.parse(userStr) as UsuarioAutenticado;
    } catch {
      return null;
    }
  }

  /**
   * Obtiene el token de autenticación.
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtiene el usuario actualmente autenticado.
   */
  getUsuarioActual(): UsuarioAutenticado | null {
    return this.usuarioSubject.value;
  }

  /**
   * Determina si existe una sesión activa.
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * Cierra la sesión actual.
   */
  logout(): void {

    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);

    this.usuarioSubject.next(null);
  }
  obtenerRutaPorRol(rol: string): string {
    switch (rol) {
      case 'ADMIN':
        return '/dashboard';
      case 'OPERARIO':
        return '/user-panel/produccion';
      default:
        return '/login';
    }
  }
}