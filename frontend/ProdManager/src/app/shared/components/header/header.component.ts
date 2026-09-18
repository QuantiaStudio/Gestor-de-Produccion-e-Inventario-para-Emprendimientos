import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  nombreUsuario = 'Usuario';
  rolUsuario = 'Operador';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const usuario = this.authService.getUsuarioActual();
    if (usuario) {
      this.nombreUsuario = `${usuario.nombre} ${usuario.apellido}`;
      this.rolUsuario = usuario.rol === 'ADMIN' ? 'Administrador' : 'Operador';
    }
  }
}
