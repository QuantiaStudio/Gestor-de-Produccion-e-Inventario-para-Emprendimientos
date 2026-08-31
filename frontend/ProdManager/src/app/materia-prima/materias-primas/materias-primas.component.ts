import { Component } from '@angular/core';
import { MateriaPrima } from '../../models/materia-prima/materia-prima.model';
import { MateriaPrimaService } from '../../services/materia-prima.service';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MateriaPrimaDetalleComponent } from '../materia-prima-detalle/materia-prima-detalle.component';

@Component({
  selector: 'app-materias-primas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MateriaPrimaDetalleComponent],
  templateUrl: './materias-primas.component.html',
  styleUrl: './materias-primas.component.css'
})
export class MateriasPrimasComponent {
  materiasPrimas: MateriaPrima[];
  materiaPrimaSeleccionada: MateriaPrima | null = null;
  materiaPrimaAEliminar: MateriaPrima | null = null;

   categoriasDisponibles = ['Materia Textil', 'Insumos', 'Envases', 'Químicos'];
   unidadesDisponibles = ['kg', 'unidades', 'litros', 'metros'];
  
  formRegistro = new FormGroup({
    codigo: new FormControl('', Validators.required),
    nombre: new FormControl('', Validators.required),
    categoria: new FormControl('', Validators.required),
    unidad: new FormControl('', Validators.required),
    stock: new FormControl(0, [Validators.required, Validators.min(0)]),
    nivelMinimo: new FormControl(0, [Validators.required, Validators.min(0)]),
    descripcion: new FormControl('')
  });

  formActualizar = new FormGroup({
    id: new FormControl('', Validators.required),
    stockTotal: new FormControl(0, [Validators.required, Validators.min(0)]),
    stockMinimo: new FormControl(0, [Validators.required, Validators.min(0)]),
  });

  constructor(private materiaPrimaService: MateriaPrimaService) {
    this.materiasPrimas = this.materiaPrimaService.obtenerMateriasPrimas();
  }

  seleccionar(materiaPrima: MateriaPrima) {
    this.materiaPrimaSeleccionada = materiaPrima;
  }

  cerrarDetalle() {
    this.materiaPrimaSeleccionada = null;
  }

  cargarMateriaParaActualizar(id: string) {
    const materiaPrima = this.materiasPrimas.find(mp => mp.id === id);
    if (!materiaPrima) return;
    this.formActualizar.setValue({
      id: materiaPrima.id,
      stockTotal: materiaPrima.stockTotal,
      stockMinimo: materiaPrima.stockMinimo,
    });
  }

  actualizarMateriaPrima() {
    const valoresForm = this.formActualizar.value;
    if (!valoresForm.id) return;

    this.materiaPrimaService.actualizarStock(valoresForm.id, valoresForm.stockTotal!, valoresForm.stockMinimo!);
    this.formActualizar.reset({ id: '', stockTotal: 0, stockMinimo: 0 });
  }

  pedirConfirmacionEliminar(materiaPrima: MateriaPrima) {
    this.materiaPrimaAEliminar = materiaPrima;
  }

  cancelarEliminar() {
    this.materiaPrimaAEliminar = null;
  }

  confirmarEliminar() {
    if (!this.materiaPrimaAEliminar) return;
    this.materiaPrimaService.eliminar(this.materiaPrimaAEliminar.id);
    this.materiaPrimaAEliminar = null;
  }

  guardarMateriaPrima() {
    const valoresForm = this.formRegistro.value;

    let estadoCalculado: any = 'Optimo';
    if (valoresForm.stock === 0) estadoCalculado = 'Sin Stock';
    else if (valoresForm.stock! <= valoresForm.nivelMinimo!) estadoCalculado = 'Bajo Mínimo';

    const nuevaMateriaPrima = {
      id: valoresForm.codigo!,
      nombre: valoresForm.nombre!,
      categoria: valoresForm.categoria!,
      unidadMedida: valoresForm.unidad!,
      stockTotal: valoresForm.stock!,
      stockDisponible: valoresForm.stock!, 
      stockMinimo: valoresForm.nivelMinimo!,
      estado: estadoCalculado,
      descripcion: valoresForm.descripcion || '',
      proveedor: 'Sin asignar',
      ultimaActualizacion: new Date().toLocaleDateString()
    };
}
}
