import { Component } from '@angular/core';
import { MateriaPrima } from '../../models/materia-prima/materia-prima.model';
import { MateriaPrimaService } from '../../services/materia-prima.service';
import { MateriaPrimaDetalleComponent } from '../materia-prima-detalle/materia-prima-detalle.component';
import { MateriaPrimaMovimientoFormComponent } from '../materia-prima-movimiento-form/materia-prima-movimiento-form.component';

@Component({
  selector: 'app-materia-prima-listado',
  standalone: true,
  imports: [MateriaPrimaDetalleComponent, MateriaPrimaMovimientoFormComponent],
  templateUrl: './materia-prima-listado.component.html',
  styleUrl: './materia-prima-listado.component.css'
})
export class MateriaPrimaListadoComponent {
  materiaPrimaSeleccionada: MateriaPrima | null = null;
  mostrarFormMovimiento = false;
  materiasPrimas: MateriaPrima[];

  constructor(private materiaPrimaService: MateriaPrimaService) {
    this.materiasPrimas = this.materiaPrimaService.obtenerMateriasPrimas();
  }

  seleccionar(materiaPrima: MateriaPrima) {
    this.materiaPrimaSeleccionada = materiaPrima;
  }

  cerrarDetalle() {
    this.materiaPrimaSeleccionada = null;
  }

  abrirFormMovimiento() {
    this.mostrarFormMovimiento = true;
  }

  cerrarFormMovimiento() {
    this.mostrarFormMovimiento = false;
  }
}
