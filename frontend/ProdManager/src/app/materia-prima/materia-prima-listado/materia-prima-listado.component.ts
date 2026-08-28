import { Component } from '@angular/core';
import { MateriaPrima } from '../materia-prima.model';
import { MateriaPrimaService } from '../materia-prima.service';
import { MateriaPrimaDetalleComponent } from '../materia-prima-detalle/materia-prima-detalle.component';

@Component({
  selector: 'app-materia-prima-listado',
  standalone: true,
  imports: [MateriaPrimaDetalleComponent],
  templateUrl: './materia-prima-listado.component.html',
  styleUrl: './materia-prima-listado.component.css'
})
export class MateriaPrimaListadoComponent {
  materiaPrimaSeleccionada: MateriaPrima | null = null;
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
}
