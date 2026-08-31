import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MateriaPrima } from '../../models/materia-prima/materia-prima.model';

@Component({
  selector: 'app-materia-prima-detalle',
  standalone: true,
  imports: [],
  templateUrl: './materia-prima-detalle.component.html',
  styleUrl: './materia-prima-detalle.component.css'
})
export class MateriaPrimaDetalleComponent {
  @Input({ required: true }) materiaPrima!: MateriaPrima;
  @Output() cerrar = new EventEmitter<void>();
}
