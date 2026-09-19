import { Component, OnInit } from '@angular/core';
import { MateriaPrima } from '../../../../../models/materia-prima/materia-prima.model';
import { MateriaPrimaService } from '../../../../../services/materia-prima.service';
import { MateriaPrimaDetalleComponent } from '../materia-prima-detalle/materia-prima-detalle.component';
import { MateriaPrimaMovimientoFormComponent } from '../materia-prima-movimiento-form/materia-prima-movimiento-form.component';

@Component({
  selector: 'app-materia-prima-listado',
  standalone: true,
  imports: [MateriaPrimaDetalleComponent, MateriaPrimaMovimientoFormComponent],
  templateUrl: './materia-prima-listado.component.html',
  styleUrl: './materia-prima-listado.component.css'
})
export class MateriaPrimaListadoComponent implements OnInit {
  materiaPrimaSeleccionada: MateriaPrima | null = null;
  mostrarFormMovimiento = false;
  materiaParaActualizarId = '';
  busqueda = '';
  materiasPrimas: MateriaPrima[] = [];

  constructor(private materiaPrimaService: MateriaPrimaService) {
  }

  ngOnInit() {
    this.materiaPrimaService.obtenerMateriasPrimas$().subscribe({
      next: materiasPrimas => this.materiasPrimas = materiasPrimas,
      error: error => console.error('Error al cargar materias primas', error)
    });
  }

  get materiasFiltradas(): MateriaPrima[] {
    const texto = this.busqueda.trim().toLowerCase();
    if (!texto) return this.materiasPrimas;
    return this.materiasPrimas.filter(mp =>
      mp.nombre.toLowerCase().includes(texto) || mp.id.includes(texto)
    );
  }

  seleccionar(materiaPrima: MateriaPrima) {
    this.materiaPrimaSeleccionada = materiaPrima;
  }

  cerrarDetalle() {
    this.materiaPrimaSeleccionada = null;
  }

  abrirActualizarStock(materiaPrima: MateriaPrima) {
    this.materiaParaActualizarId = materiaPrima.id;
    this.mostrarFormMovimiento = true;
  }

  cerrarFormMovimiento() {
    this.mostrarFormMovimiento = false;
  }
}
