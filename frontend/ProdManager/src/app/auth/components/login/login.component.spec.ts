import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';

describe('LoginComponent', () => {

  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {

    authService = jasmine.createSpyObj(
      'AuthService',
      ['login']
    );

    router = jasmine.createSpyObj(
      'Router',
      ['navigate']
    );

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent
      ],
      providers: [
        {
          provide: AuthService,
          useValue: authService
        },
        {
          provide: Router,
          useValue: router
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });


  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });


  it('el formulario debería comenzar inválido', () => {
    expect(component.loginForm.invalid).toBeTrue();
  });


  it('debería marcar el formulario como tocado si se envía vacío', () => {

    component.onSubmit();

    expect(component.loginForm.touched).toBeTrue();
  });


  it('debería validar correctamente un email', () => {

    const emailControl = component.email;

    emailControl?.setValue('correo-invalido');

    expect(emailControl?.hasError('email')).toBeTrue();
  });


  it('debería validar que la contraseña sea obligatoria', () => {

    const passwordControl = component.password;

    passwordControl?.setValue('');

    expect(passwordControl?.hasError('required')).toBeTrue();
  });

});
