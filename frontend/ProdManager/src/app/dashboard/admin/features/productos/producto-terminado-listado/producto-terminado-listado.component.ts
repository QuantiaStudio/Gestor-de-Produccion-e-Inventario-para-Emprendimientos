import { Component } from '@angular/core';
import { FiltroProductoTerminado, ProductoTerminado, ResumenInventario } from '../../../../../models/producto/producto-terminado.model';
import { ProductoTerminadoService } from '../../../../../services/producto-terminado.service';
import { ProductoTerminadoAlertasComponent } from '../producto-terminado-alertas/producto-terminado-alertas.component';
import { ProductoTerminadoDetalleComponent } from '../producto-terminado-detalle/producto-terminado-detalle.component';
import { ProductoTerminadoFiltrosComponent } from '../producto-terminado-filtros/producto-terminado-filtros.component';

@Component({
  selector: 'app-producto-terminado-listado',
  standalone: true,
  imports: [ProductoTerminadoAlertasComponent, ProductoTerminadoDetalleComponent, ProductoTerminadoFiltrosComponent],
  templateUrl: './producto-terminado-listado.component.html',
  styleUrl: './producto-terminado-listado.component.css'
})
export class ProductoTerminadoListadoComponent {
  productoSeleccionado: ProductoTerminado | null = null;
  productosTerminados: ProductoTerminado[];
  categorias: string[];
  resumen: ResumenInventario;

  constructor(private productoTerminadoService: ProductoTerminadoService) {
    this.productosTerminados = this.productoTerminadoService.obtenerProductosTerminados();
    this.categorias = this.productoTerminadoService.obtenerCategorias();
    this.resumen = this.productoTerminadoService.obtenerResumenInventario(this.productosTerminados);
  }

  aplicarFiltros(filtros: FiltroProductoTerminado) {
    this.productosTerminados = this.productoTerminadoService.filtrar(filtros);
    this.resumen = this.productoTerminadoService.obtenerResumenInventario(this.productosTerminados);

    const seleccionado = this.productoSeleccionado;
    if (seleccionado && !this.productosTerminados.some(pt => pt.id === seleccionado.id)) {
      this.cerrarDetalle();
    }
  }

  seleccionar(producto: ProductoTerminado) {
    this.productoSeleccionado = producto;
  }

  cerrarDetalle() {
    this.productoSeleccionado = null;
  }
}
