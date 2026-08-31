import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {

  let service: AuthService;

  beforeEach(() => {

    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthService
      ]
    });

    service = TestBed.inject(AuthService);
  });


  afterEach(() => {
    localStorage.clear();
  });


  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });


  it('debería iniciar sesión con credenciales válidas', () => {

    const credenciales = {
      email: 'admin@correo.com',
      password: '123456'
    };

    service.login(credenciales).subscribe(respuesta => {

      expect(respuesta.exito).toBeTrue();
      expect(respuesta.usuario).toBeTruthy();
      expect(respuesta.usuario?.rol).toBe('ADMIN');

    });

    expect(service.isLoggedIn()).toBeTrue();
  });


  it('debería rechazar credenciales inválidas', () => {

    const credenciales = {
      email: 'usuario@correo.com',
      password: 'incorrecta'
    };

    service.login(credenciales).subscribe(respuesta => {

      expect(respuesta.exito).toBeFalse();

      expect(respuesta.mensaje)
        .toContain('Credenciales inválidas');

    });

    expect(service.isLoggedIn()).toBeFalse();
  });


  it('debería guardar y recuperar el usuario autenticado', () => {

    const credenciales = {
      email: 'admin@correo.com',
      password: '123456'
    };

    service.login(credenciales).subscribe();

    const usuario = service.getUsuarioActual();

    expect(usuario).not.toBeNull();
    expect(usuario?.email)
      .toBe('admin@correo.com');

  });


  it('debería cerrar la sesión correctamente', () => {

    const credenciales = {
      email: 'admin@correo.com',
      password: '123456'
    };

    service.login(credenciales).subscribe();

    expect(service.isLoggedIn()).toBeTrue();

    service.logout();

    expect(service.isLoggedIn()).toBeFalse();
    expect(service.getUsuarioActual()).toBeNull();
  });

});