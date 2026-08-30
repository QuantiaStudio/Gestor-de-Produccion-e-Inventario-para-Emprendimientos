import { Component } from '@angular/core';
import { ProductoTerminado } from '../../models/producto-terminado/producto-terminado.model';
import { ProductoTerminadoService } from '../../services/producto-terminado.service';

@Component({
  selector: 'app-producto-terminado-listado',
  standalone: true,
  imports: [],
  templateUrl: './producto-terminado-listado.component.html',
  styleUrl: './producto-terminado-listado.component.css'
})
export class ProductoTerminadoListadoComponent {
  productosTerminados: ProductoTerminado[];

  constructor(private productoTerminadoService: ProductoTerminadoService) {
    this.productosTerminados = this.productoTerminadoService.obtenerProductosTerminados();
  }
}
