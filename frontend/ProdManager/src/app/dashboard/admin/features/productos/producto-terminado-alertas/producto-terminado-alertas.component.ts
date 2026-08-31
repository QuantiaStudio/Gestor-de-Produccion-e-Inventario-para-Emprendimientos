import { Component, Input } from '@angular/core';
import { ResumenInventario } from '../../../../../models/producto-terminado/producto-terminado.model';

@Component({
  selector: 'app-producto-terminado-alertas',
  standalone: true,
  imports: [],
  templateUrl: './producto-terminado-alertas.component.html',
  styleUrl: './producto-terminado-alertas.component.css'
})
export class ProductoTerminadoAlertasComponent {
  @Input({ required: true }) resumen!: ResumenInventario;
}
