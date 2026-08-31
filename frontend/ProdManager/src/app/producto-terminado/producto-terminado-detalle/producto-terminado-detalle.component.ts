import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProductoTerminado } from '../../models/producto-terminado/producto-terminado.model';

type TabDetalle = 'informacion' | 'movimientos';

@Component({
  selector: 'app-producto-terminado-detalle',
  standalone: true,
  imports: [],
  templateUrl: './producto-terminado-detalle.component.html',
  styleUrl: './producto-terminado-detalle.component.css'
})
export class ProductoTerminadoDetalleComponent {
  @Input({ required: true }) producto!: ProductoTerminado;
  @Output() cerrar = new EventEmitter<void>();

  tabActiva: TabDetalle = 'informacion';

  seleccionarTab(tab: TabDetalle) {
    this.tabActiva = tab;
  }
}
