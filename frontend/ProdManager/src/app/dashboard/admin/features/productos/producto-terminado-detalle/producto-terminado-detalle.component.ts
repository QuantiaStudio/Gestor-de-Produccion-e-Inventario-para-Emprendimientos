import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProductoTerminado } from '../../../../../models/producto/producto-terminado.model';
import { ProductoTerminadoService } from '../../../../../services/producto-terminado.service';

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
  @Output() eliminado = new EventEmitter<void>();
  @Output() editar = new EventEmitter<void>();

  tabActiva: TabDetalle = 'informacion';
  confirmarEliminacion = false;
  eliminando = false;
  errorEliminacion = '';

  constructor(private productoTerminadoService: ProductoTerminadoService) {}

  seleccionarTab(tab: TabDetalle) {
    this.tabActiva = tab;
  }

  solicitarEliminacion() {
    this.errorEliminacion = '';
    this.confirmarEliminacion = true;
  }

  cancelarEliminacion() {
    if (!this.eliminando) this.confirmarEliminacion = false;
  }

  eliminarProducto() {
    if (!this.producto.apiId || this.eliminando) return;

    this.eliminando = true;
    this.productoTerminadoService.eliminarProducto(this.producto.apiId).subscribe({
      next: () => {
        this.eliminando = false;
        this.confirmarEliminacion = false;
        this.eliminado.emit();
      },
      error: () => {
        this.eliminando = false;
        this.errorEliminacion = 'No se pudo eliminar el producto. Intenta nuevamente.';
      }
    });
  }
}
