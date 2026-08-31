import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

import {
  CredencialesLogin,
  RespuestaAutenticacion,
  UsuarioAutenticado
} from '../models/usuario-autenticado';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  private usuarioSubject = new BehaviorSubject<UsuarioAutenticado | null>(
    this.obtenerUsuarioDeStorage()
  );

  public usuario$ = this.usuarioSubject.asObservable();

  /**
   * Simula el proceso de autenticación.
   *
   * Credenciales de prueba:
   * email: admin@correo.com
   * contraseña: 123456
   */
  login(
    credenciales: CredencialesLogin
  ): Observable<RespuestaAutenticacion> {

    if (
      credenciales.email === 'admin@correo.com' &&
      credenciales.password === '123456'
    ) {

      const usuarioMock: UsuarioAutenticado = {
        id: '1',
        nombre: 'Usuario Demo',
        email: credenciales.email,
        rol: 'ADMIN',
        token: 'token-fake-jwt-12345'
      };

      const respuestaExito: RespuestaAutenticacion = {
        exito: true,
        mensaje: 'Inicio de sesión exitoso',
        usuario: usuarioMock,
        token: usuarioMock.token
      };

      this.guardarSesion(
        respuestaExito.token!,
        respuestaExito.usuario!
      );

      return of(respuestaExito);
    }

    return of({
      exito: false,
      mensaje: 'Credenciales inválidas. Verificá tu correo y contraseña.'
    });
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
}