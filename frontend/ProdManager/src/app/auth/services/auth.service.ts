import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { CredencialesLogin, DatosUsuarioApi, RespuestaAutenticacion, RespuestaLoginApi, UsuarioAutenticado } from '../models/usuario-autenticado';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  private readonly authApiUrl = `${environment.djangoApiUrl}/auth`;

  private usuarioSubject = new BehaviorSubject<UsuarioAutenticado | null>(
    this.obtenerUsuarioDeStorage()
  );

  public usuario$ = this.usuarioSubject.asObservable();

  registrarAdministrador(datos: {
    nombre: string;
    apellido: string;
    email: string;
    contrasena: string;
  }): Observable<DatosUsuarioApi> {
    return this.http.post<DatosUsuarioApi>(`${this.authApiUrl}/registro/`, {
      ...datos,
      email: datos.email.trim(),
    });
  }

  constructor(private http: HttpClient) {
    if (localStorage.getItem(this.TOKEN_KEY) === 'token-simulado-json-server-123') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      this.usuarioSubject.next(null);
    }
  }

  login(credenciales: CredencialesLogin): Observable<RespuestaAutenticacion> {
    return this.http.post<RespuestaLoginApi>(`${this.authApiUrl}/login/`, {
      email: credenciales.email.trim(),
      contrasena: credenciales.password,
    }).pipe(
      map(respuesta => {
        const usuario: UsuarioAutenticado = {
          id: respuesta.usuario.id_usuario,
          nombre: respuesta.usuario.nombre,
          apellido: respuesta.usuario.apellido,
          email: respuesta.usuario.email,
          rol: respuesta.usuario.rol,
          token: respuesta.token,
        };
        this.guardarSesion(respuesta.token, usuario);
        return {
          exito: true,
          mensaje: 'Inicio de sesión exitoso.',
          usuario,
          token: respuesta.token,
        };
      }),
      catchError((error: HttpErrorResponse) => of({
        exito: false,
        mensaje: this.mensajeErrorLogin(error),
      }))
    );
  }

  private mensajeErrorLogin(error: HttpErrorResponse): string {
    const code = error.error?.code;
    if (code === 'inactive_user') {
      return error.error?.detail || 'El usuario se encuentra inactivo. Contacta a un administrador.';
    }
    if (error.status === 401 || code === 'authentication_failed') {
      return 'Credenciales inválidas. Verifica tu correo y contraseña.';
    }
    if (error.status === 400) {
      return 'Ingresá un correo y una contraseña válidos.';
    }
    return 'No fue posible conectar con el servidor de autenticación.';
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
    const token = this.getToken();
    if (token) {
      const headers = new HttpHeaders({ Authorization: `Token ${token}` });
      this.http.post<void>(`${this.authApiUrl}/logout/`, {}, { headers }).subscribe({
        error: () => undefined,
      });
    }
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
