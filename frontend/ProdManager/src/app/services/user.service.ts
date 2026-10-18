import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../environments/environment';
import { DatosUsuarioApi } from '../auth/models/usuario-autenticado';
import { User } from '../models/user/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly usersUrl = `${environment.backendApiUrl}/usuarios/`;

  constructor(private readonly http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<DatosUsuarioApi[]>(this.usersUrl).pipe(
      map(usuarios => usuarios.map(usuario => this.mapUser(usuario))),
    );
  }

  createOperator(datos: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Observable<User> {
    return this.http.post<DatosUsuarioApi>(this.usersUrl, {
      nombre: datos.firstName.trim(),
      apellido: datos.lastName.trim(),
      email: datos.email.trim(),
      contrasena: datos.password,
    }).pipe(map(usuario => this.mapUser(usuario)));
  }

  private mapUser(usuario: DatosUsuarioApi): User {
    return {
      id: usuario.id_usuario,
      firstName: usuario.nombre,
      lastName: usuario.apellido,
      email: usuario.email,
      role: usuario.rol === 'ADMIN' ? 'Administrator' : 'Operator',
      isActive: usuario.estado,
    };
  }
}
