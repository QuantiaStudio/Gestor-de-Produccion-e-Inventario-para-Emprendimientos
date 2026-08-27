import { Component } from '@angular/core';
import { MateriaPrima } from '../materia-prima.model';

@Component({
  selector: 'app-materia-prima-listado',
  standalone: true,
  imports: [],
  templateUrl: './materia-prima-listado.component.html',
  styleUrl: './materia-prima-listado.component.css'
})
export class MateriaPrimaListadoComponent {
  materiasPrimas: MateriaPrima[] = [
    { id: 1, nombre: 'Tornillo 3mm', categoria: 'Herrajes', unidadMedida: 'unidades', stockTotal: 500, stockReservado: 50, stockDisponible: 450, stockMinimo: 100, estado: 'Activo' },
    { id: 2, nombre: 'Tabla de Pino 1m', categoria: 'Madera', unidadMedida: 'unidades', stockTotal: 30, stockReservado: 10, stockDisponible: 20, stockMinimo: 15, estado: 'Activo' },
    { id: 3, nombre: 'Barniz', categoria: 'Químicos', unidadMedida: 'litros', stockTotal: 8, stockReservado: 0, stockDisponible: 8, stockMinimo: 10, estado: 'Activo' },
  ];
}
