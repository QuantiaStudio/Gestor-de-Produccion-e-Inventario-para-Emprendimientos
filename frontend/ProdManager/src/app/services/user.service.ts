import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { DatosUsuarioApi } from '../auth/models/usuario-autenticado';
import { User, CreateUserDTO, UpdateUserDTO } from '../models/user/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly usersUrl = `${environment.djangoApiUrl}/usuarios/`;

  private users: User[] = [];

  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$: Observable<User[]> = this.usersSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<DatosUsuarioApi[]>(this.usersUrl).pipe(
      map(usuarios => usuarios.map(usuario => this.mapUsuario(usuario))),
      tap(usuarios => {
        this.users = usuarios;
        this.usersSubject.next([...usuarios]);
      })
    );
  }

  getUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }

  createOperator(dto: CreateUserDTO): Observable<User> {
    return this.http.post<DatosUsuarioApi>(this.usersUrl, {
      nombre: dto.firstName.trim(),
      apellido: dto.lastName.trim(),
      email: dto.email.trim(),
      contrasena: dto.password,
    }).pipe(map(usuario => this.mapUsuario(usuario)));
  }

  addCreatedUser(user: User): void {
    this.users = [user, ...this.users.filter(existing => existing.id !== user.id)];
    this.usersSubject.next([...this.users]);
  }

  private mapUsuario(usuario: DatosUsuarioApi): User {
    return {
      id: usuario.id_usuario,
      firstName: usuario.nombre,
      lastName: usuario.apellido,
      email: usuario.email,
      role: usuario.rol === 'ADMIN' ? 'Administrator' : 'Operator',
      isActive: usuario.estado,
    };
  }

  updateUser(id: number, dto: UpdateUserDTO): User | null {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) {
      return null;
    }

    this.users[index] = {
      ...this.users[index],
      ...dto,
      id
    };

    this.usersSubject.next([...this.users]);
    return this.users[index];
  }

  deleteUser(id: number): boolean {
    const initialLength = this.users.length;
    this.users = this.users.filter(user => user.id !== id);

    if (this.users.length !== initialLength) {
      this.usersSubject.next([...this.users]);
      return true;
    }
    return false;
  }

  toggleUserStatus(id: number): boolean {
    const user = this.users.find(u => u.id === id);
    if (user) {
      user.isActive = !user.isActive;
      this.usersSubject.next([...this.users]);
      return true;
    }
    return false;
  }
}
