import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActualizacionStock, FiltroProductoTerminado, ProductoTerminado, ResumenInventario } from '../../../../../models/producto-terminado/producto-terminado.model';
import { ProductoTerminadoService } from '../../../../../services/producto-terminado.service';
import { ProductoTerminadoActualizarStockComponent } from '../producto-terminado-actualizar-stock/producto-terminado-actualizar-stock.component';
import { ProductoTerminadoAlertasComponent } from '../producto-terminado-alertas/producto-terminado-alertas.component';
import { ProductoTerminadoDetalleComponent } from '../producto-terminado-detalle/producto-terminado-detalle.component';
import { ProductoTerminadoFiltrosComponent } from '../producto-terminado-filtros/producto-terminado-filtros.component';

@Component({
  selector: 'app-producto-terminado-listado',
  standalone: true,
  imports: [
    RouterLink,
    ProductoTerminadoActualizarStockComponent,
    ProductoTerminadoAlertasComponent,
    ProductoTerminadoDetalleComponent,
    ProductoTerminadoFiltrosComponent
  ],
  templateUrl: './producto-terminado-listado.component.html',
  styleUrl: './producto-terminado-listado.component.css'
})
export class ProductoTerminadoListadoComponent {
  productoSeleccionado: ProductoTerminado | null = null;
  productosTerminados: ProductoTerminado[] = [];
  catalogo: ProductoTerminado[] = [];
  categorias: string[];
  resumen: ResumenInventario;
  private filtrosActuales: FiltroProductoTerminado = {};

  constructor(private productoTerminadoService: ProductoTerminadoService) {
    this.categorias = this.productoTerminadoService.obtenerCategorias();
    this.resumen = this.productoTerminadoService.obtenerResumenInventario([]);
    this.refrescar();
  }

  aplicarFiltros(filtros: FiltroProductoTerminado) {
    this.filtrosActuales = filtros;
    this.refrescar();
  }

  actualizarStock(datos: ActualizacionStock) {
    this.productoTerminadoService.actualizarStock(datos.id, datos.stockActual, datos.stockMinimo);
    this.refrescar();
  }

  seleccionar(producto: ProductoTerminado) {
    this.productoSeleccionado = producto;
  }

  cerrarDetalle() {
    this.productoSeleccionado = null;
  }

  private refrescar() {
    this.catalogo = this.productoTerminadoService.obtenerProductosTerminados();
    this.productosTerminados = this.productoTerminadoService.filtrar(this.filtrosActuales);
    this.resumen = this.productoTerminadoService.obtenerResumenInventario(this.productosTerminados);

    const seleccionado = this.productoSeleccionado;
    if (seleccionado && !this.productosTerminados.some(pt => pt.id === seleccionado.id)) {
      this.cerrarDetalle();
    }
  }
}
