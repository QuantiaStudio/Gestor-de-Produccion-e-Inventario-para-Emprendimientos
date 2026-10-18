import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

function passwordsIguales(control: AbstractControl): ValidationErrors | null {
  const contrasena = control.get('contrasena')?.value;
  const confirmar = control.get('confirmarContrasena')?.value;
  return contrasena === confirmar ? null : { passwordsDistintas: true };
}

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css',
})
export class RegistroComponent {
  readonly registroForm: FormGroup;

  enviando = false;
  mensajeError = '';
  registroExitoso = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
  ) {
    this.registroForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      apellido: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
      contrasena: ['', [Validators.required, Validators.minLength(8)]],
      confirmarContrasena: ['', Validators.required],
    }, { validators: passwordsIguales });
  }

  registrar(): void {
    this.mensajeError = '';
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    this.enviando = true;
    const { nombre, apellido, email, contrasena } = this.registroForm.getRawValue();
    this.authService.registrarAdministrador({ nombre: nombre!, apellido: apellido!, email: email!, contrasena: contrasena! }).subscribe({
      next: () => {
        this.enviando = false;
        this.registroExitoso = true;
        this.registroForm.disable();
      },
      error: (error: HttpErrorResponse) => {
        this.enviando = false;
        this.mensajeError = this.mensajeErrorApi(error);
      },
    });
  }

  private mensajeErrorApi(error: HttpErrorResponse): string {
    const errores = error.error?.errors;
    const primerError = errores ? Object.values(errores).flat()[0] : null;
    if (primerError) return this.traducirErrorContrasena(String(primerError));
    if (error.status === 0) return 'No se pudo conectar con el servidor. Intentalo nuevamente.';
    return error.error?.detail || 'No se pudo crear la cuenta. Revisá los datos e intentá nuevamente.';
  }

  private traducirErrorContrasena(mensaje: string): string {
    const mensajeNormalizado = mensaje.toLowerCase();
    if (mensajeNormalizado.includes('too short')) {
      return 'La contraseña debe tener al menos 8 caracteres.';
    }
    if (mensajeNormalizado.includes('too common')) {
      return 'La contraseña es demasiado común. Elegí otra.';
    }
    if (mensajeNormalizado.includes('entirely numeric')) {
      return 'La contraseña no puede estar formada solo por números.';
    }
    if (mensajeNormalizado.includes('too similar')) {
      return 'La contraseña no puede ser tan parecida a tus datos personales.';
    }
    return mensaje;
  }
}
