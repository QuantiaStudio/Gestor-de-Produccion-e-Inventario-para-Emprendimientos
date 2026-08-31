import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, CreateUserDTO, UpdateUserDTO } from '../models/user/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private users: User[] = [
    {
      id: 1,
      firstName: 'Genaro',
      lastName: 'Cura',
      email: 'genaro.cura@quantia.com',
      role: 'Administrator',
      isActive: true
    },
    {
      id: 2,
      firstName: 'Rocío',
      lastName: 'Altamirano',
      email: 'rocio.altamirano@quantia.com',
      role: 'Operator',
      isActive: true
    },
    {
      id: 3,
      firstName: 'Mauro',
      lastName: 'Mendieta',
      email: 'mauro.mendieta@quantia.com',
      role: 'Operator',
      isActive: true
    },
    {
      id: 4,
      firstName: 'Cesia',
      lastName: 'Cáceres',
      email: 'cesia.caceres@quantia.com',
      role: 'Administrator',
      isActive: true
    },
    {
      id: 5,
      firstName: 'Lautaro',
      lastName: 'Villafañe',
      email: 'lautaro.villafane@quantia.com',
      role: 'Operator',
      isActive: false
    }
  ];

  private usersSubject = new BehaviorSubject<User[]>([...this.users]);
  public users$: Observable<User[]> = this.usersSubject.asObservable();

  private currentUser: User = this.users[0];

  getUsers(): User[] {
    return [...this.users];
  }

  getUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }

  getCurrentUser(): User {
    return this.currentUser;
  }

  createUser(dto: CreateUserDTO): User {
    const nextId = this.users.length > 0 ? Math.max(...this.users.map(u => u.id)) + 1 : 1;
    const newUser: User = {
      id: nextId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: dto.password,
      role: dto.role,
      isActive: dto.isActive
    };

    this.users.push(newUser);
    this.usersSubject.next([...this.users]);
    return newUser;
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
