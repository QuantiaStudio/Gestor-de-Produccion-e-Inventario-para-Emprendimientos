import { Component } from '@angular/core';
import { ActualizacionStock, EstadoProductoTerminado, FiltroProductoTerminado, ProductoTerminado, ResumenInventario } from '../../../../../models/producto/producto-terminado.model';
import { ProductoTerminadoService } from '../../../../../services/producto-terminado.service';
import { NewProductFormComponent } from '../new-product-form/new-product-form.component';
import { ProductoTerminadoActualizarStockComponent } from '../producto-terminado-actualizar-stock/producto-terminado-actualizar-stock.component';
import { ProductoTerminadoAlertasComponent } from '../producto-terminado-alertas/producto-terminado-alertas.component';
import { ProductoTerminadoDetalleComponent } from '../producto-terminado-detalle/producto-terminado-detalle.component';
import { ProductoTerminadoFiltrosComponent } from '../producto-terminado-filtros/producto-terminado-filtros.component';

@Component({
  selector: 'app-producto-terminado-listado',
  standalone: true,
  imports: [
    NewProductFormComponent,
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
  estados: EstadoProductoTerminado[] = [];
  resumen: ResumenInventario;
  mostrarFormularioNuevoProducto = false;
  productoEnEdicion: ProductoTerminado | null = null;
  mensajeExito = '';
  private filtrosActuales: FiltroProductoTerminado = {};

  constructor(private productoTerminadoService: ProductoTerminadoService) {
    this.categorias = [];
    this.resumen = this.productoTerminadoService.obtenerResumenInventario([]);
    this.cargarProductosDesdeApi();
  }

  aplicarFiltros(filtros: FiltroProductoTerminado) {
    this.filtrosActuales = filtros;
    this.refrescar();
  }

  actualizarStock(datos: ActualizacionStock) {
    this.productoTerminadoService.actualizarStock(datos.id, datos.stockActual, datos.stockMinimo);
    this.refrescar();
  }

  abrirFormularioNuevoProducto() {
    this.mensajeExito = '';
    this.productoEnEdicion = null;
    this.mostrarFormularioNuevoProducto = true;
  }

  cerrarFormularioNuevoProducto() {
    this.mostrarFormularioNuevoProducto = false;
    this.productoEnEdicion = null;
  }

  editarProducto() {
    if (!this.productoSeleccionado) return;

    this.mensajeExito = '';
    this.productoEnEdicion = this.productoSeleccionado;
    this.productoSeleccionado = null;
    this.mostrarFormularioNuevoProducto = true;
  }

  productoActualizado() {
    this.cargarProductosDesdeApi(() => {
      this.mostrarFormularioNuevoProducto = false;
      this.productoEnEdicion = null;
      this.mensajeExito = 'El producto se actualizó correctamente.';
    });
  }

  productoCreado() {
    this.cargarProductosDesdeApi(() => {
      this.mostrarFormularioNuevoProducto = false;
      this.mensajeExito = 'El producto se creó correctamente.';
    });
  }

  seleccionar(producto: ProductoTerminado) {
    this.productoSeleccionado = producto;
  }

  estaEnProduccion(producto: ProductoTerminado): boolean {
    return producto.estado === 'en_produccion';
  }

  estaBajoStock(producto: ProductoTerminado): boolean {
    return producto.stockActual > 0 && producto.stockActual <= producto.stockMinimo;
  }

  estaSinStock(producto: ProductoTerminado): boolean {
    return producto.stockActual === 0;
  }

  cerrarDetalle() {
    this.productoSeleccionado = null;
  }

  productoEliminado() {
    this.productoSeleccionado = null;
    this.cargarProductosDesdeApi();
  }

  private cargarProductosDesdeApi(alCargar?: () => void) {
    this.productoTerminadoService.cargarProductosTerminados().subscribe({
      next: (productos) => {
        this.catalogo = productos;
        this.categorias = this.productoTerminadoService.obtenerCategorias();
        this.estados = this.productoTerminadoService.obtenerEstados();
        this.refrescar();
        alCargar?.();
      },
      error: (error) => {
        console.error('Error al cargar productos desde la API', error);
        this.catalogo = [];
        this.productosTerminados = [];
        this.categorias = [];
        this.resumen = this.productoTerminadoService.obtenerResumenInventario([]);
      }
    });
  }

  private refrescar() {
    this.catalogo = this.productoTerminadoService.obtenerProductosTerminados();
    this.productosTerminados = this.productoTerminadoService.filtrar(this.filtrosActuales);
    this.resumen = this.productoTerminadoService.obtenerResumenInventario(this.productosTerminados);
    this.categorias = this.productoTerminadoService.obtenerCategorias();

    const seleccionado = this.productoSeleccionado;
    if (seleccionado && !this.productosTerminados.some(pt => pt.id === seleccionado.id)) {
      this.cerrarDetalle();
    }
  }
}
