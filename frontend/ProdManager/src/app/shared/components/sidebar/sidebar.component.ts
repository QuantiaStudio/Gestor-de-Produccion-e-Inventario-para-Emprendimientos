import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  userRole = '';
  nombreUsuario = 'Usuario';
  rolUsuario = 'Operador';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const usuario = this.authService.getUsuarioActual();
    if (usuario) {
      this.userRole = usuario.rol;
      this.nombreUsuario = `${usuario.nombre} ${usuario.apellido}`;
      this.rolUsuario = usuario.rol === 'ADMIN' ? 'Administrador' : 'Operador';
    }
  }
}
