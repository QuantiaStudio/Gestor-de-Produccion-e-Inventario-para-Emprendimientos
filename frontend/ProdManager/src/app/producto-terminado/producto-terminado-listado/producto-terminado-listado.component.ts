import { Component } from '@angular/core';
import { ProductoTerminado } from '../../models/producto-terminado/producto-terminado.model';
import { ProductoTerminadoService } from '../../services/producto-terminado.service';
import { ProductoTerminadoDetalleComponent } from '../producto-terminado-detalle/producto-terminado-detalle.component';

@Component({
  selector: 'app-producto-terminado-listado',
  standalone: true,
  imports: [ProductoTerminadoDetalleComponent],
  templateUrl: './producto-terminado-listado.component.html',
  styleUrl: './producto-terminado-listado.component.css'
})
export class ProductoTerminadoListadoComponent {
  productoSeleccionado: ProductoTerminado | null = null;
  productosTerminados: ProductoTerminado[];

  constructor(private productoTerminadoService: ProductoTerminadoService) {
    this.productosTerminados = this.productoTerminadoService.obtenerProductosTerminados();
  }

  seleccionar(producto: ProductoTerminado) {
    this.productoSeleccionado = producto;
  }

  cerrarDetalle() {
    this.productoSeleccionado = null;
  }
}
