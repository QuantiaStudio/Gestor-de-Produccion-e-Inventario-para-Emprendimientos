import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginForm: FormGroup;

  mensajeError = '';
  mensajeExito = '';
  enviando = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {

    this.loginForm = this.formBuilder.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6)
        ]
      ]
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit(): void {

    this.mensajeError = '';
    this.mensajeExito = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.enviando = true;

    const credenciales = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.login(credenciales).subscribe({
      next: (respuesta) => {

        this.enviando = false;

        if (respuesta.exito) {

          this.mensajeExito =
            respuesta.mensaje || 'Inicio de sesión exitoso.';

          /*
           * Redirección al dashboard.
           *
           * La redirección específica según rol
           * corresponde a HU16.
           */
          this.router.navigate(['/dashboard']);

        } else {

          this.mensajeError =
            respuesta.mensaje || 'No fue posible iniciar sesión.';
        }
      },

      error: () => {

        this.enviando = false;

        this.mensajeError =
          'Ocurrió un error al intentar iniciar sesión.';
      }
    });
  }
}