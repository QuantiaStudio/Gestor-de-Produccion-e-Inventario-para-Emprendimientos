import { Component } from '@angular/core';
import { ProductoTerminado, ResumenInventario } from '../../models/producto-terminado/producto-terminado.model';
import { ProductoTerminadoService } from '../../services/producto-terminado.service';
import { ProductoTerminadoAlertasComponent } from '../producto-terminado-alertas/producto-terminado-alertas.component';
import { ProductoTerminadoDetalleComponent } from '../producto-terminado-detalle/producto-terminado-detalle.component';

@Component({
  selector: 'app-producto-terminado-listado',
  standalone: true,
  imports: [ProductoTerminadoAlertasComponent, ProductoTerminadoDetalleComponent],
  templateUrl: './producto-terminado-listado.component.html',
  styleUrl: './producto-terminado-listado.component.css'
})
export class ProductoTerminadoListadoComponent {
  productoSeleccionado: ProductoTerminado | null = null;
  productosTerminados: ProductoTerminado[];
  resumen: ResumenInventario;

  constructor(private productoTerminadoService: ProductoTerminadoService) {
    this.productosTerminados = this.productoTerminadoService.obtenerProductosTerminados();
    this.resumen = this.productoTerminadoService.obtenerResumenInventario(this.productosTerminados);
  }

  seleccionar(producto: ProductoTerminado) {
    this.productoSeleccionado = producto;
  }

  cerrarDetalle() {
    this.productoSeleccionado = null;
  }
}
