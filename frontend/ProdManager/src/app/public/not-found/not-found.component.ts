import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css'
})
export class NotFoundComponent implements OnInit {
  rutaDestino = '/';
  textoBoton = 'Volver al Inicio';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      const usuario = this.authService.getUsuarioActual();
      if (usuario) {
        this.rutaDestino = this.authService.obtenerRutaPorRol(usuario.rol);
        this.textoBoton = 'Volver a mi panel';
      }
    }
  }
}
