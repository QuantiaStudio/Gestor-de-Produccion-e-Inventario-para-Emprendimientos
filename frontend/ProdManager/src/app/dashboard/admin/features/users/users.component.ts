import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthService } from '../../../../auth/services/auth.service';
import { User } from '../../../../models/user/user.model';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm = '';
  isCurrentAdmin = false;
  isLoading = false;
  isSaving = false;
  mensajeError = '';
  mensajeExito = '';
  userForm: FormGroup;

  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    formBuilder: FormBuilder,
  ) {
    this.userForm = formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  ngOnInit(): void {
    this.isCurrentAdmin = this.authService.getUsuarioActual()?.rol === 'ADMIN';
    if (!this.isCurrentAdmin) return;

    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: users => {
        this.users = users;
        this.applyFilters();
        this.isLoading = false;
      },
      error: error => {
        this.mensajeError = this.mensajeErrorApi(error, 'No se pudo cargar la lista de usuarios.');
        this.isLoading = false;
      },
    });
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(term),
    );
  }

  registrarOperario(): void {
    this.mensajeError = '';
    this.mensajeExito = '';
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.userService.createOperator(this.userForm.getRawValue()).subscribe({
      next: user => {
        this.users = [user, ...this.users];
        this.applyFilters();
        this.userForm.reset();
        this.mensajeExito = `Se creó la cuenta de operario para ${user.firstName} ${user.lastName}.`;
        this.isSaving = false;
      },
      error: error => {
        this.mensajeError = this.mensajeErrorApi(error, 'No se pudo crear el usuario.');
        this.isSaving = false;
      },
    });
  }

  private mensajeErrorApi(error: HttpErrorResponse, fallback: string): string {
    const errores = error.error?.errors;
    const primerError = errores ? Object.values(errores).flat()[0] : null;
    if (primerError) return String(primerError);
    if (error.status === 401 || error.status === 403) return 'Tu sesión no tiene permisos para gestionar usuarios.';
    if (error.status === 0) return 'No se pudo conectar con Django. Comprobá que el backend esté iniciado.';
    return error.error?.detail || fallback;
  }
}
