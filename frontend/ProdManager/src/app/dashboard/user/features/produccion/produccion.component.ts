import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProduccionService } from '../../../../services/produccion.service';
import { OrdenProduccion } from '../../../../models/orden-produccion/orden-produccion.model';
import { ProductoTerminado } from '../../../../models/producto/producto-terminado.model';
import { ProductoTerminadoService } from '../../../../services/producto-terminado.service';
import { NuevaOrdenProduccion } from '../../../../models/orden-produccion/orden-produccion.model';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

@Component({
  selector: 'app-produccion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './produccion.component.html',
  styleUrl: './produccion.component.css'
})
export class ProduccionComponent implements OnInit {
  ordenes: OrdenProduccion[] = [];
  productos: ProductoTerminado[] = [];
  ordenForm!: FormGroup<{
    productoId: FormControl<string>;
    cantidad: FormControl<number>;
    observaciones: FormControl<string>;
  }>;

  Ordenseleccionada?: OrdenProduccion;

  constructor(
    private produccionService: ProduccionService, 
    private formBuilder: FormBuilder, 
    private productoTerminadoService: ProductoTerminadoService,
  ) {
    this.ordenForm = this.formBuilder.nonNullable.group({
      productoId: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.ordenes = this.produccionService.obtenerOrdenes();
    this.productos = this.productoTerminadoService.obtenerProductosTerminados();
  }

  mostrarFormulario = false;

  abrirFormulario(): void {
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
  }

  seleccionarOrden(orden: OrdenProduccion): void {
    this.Ordenseleccionada = orden;
  }
  private recargarOrdenes(): void {
    this.ordenes = this.produccionService.obtenerOrdenes();
  }
  iniciar(orden: OrdenProduccion): void {
    this.produccionService.iniciarProduccion(orden.id);
    this.recargarOrdenes();
  }
  finalizar(orden: OrdenProduccion): void {
    this.produccionService.finalizarProduccion(orden.id);
    this.recargarOrdenes();
  }
  cancelar(orden: OrdenProduccion): void {
    const motivo = prompt('Ingrese el motivo de la cancelación:');
    if (motivo) {
      this.produccionService.cancelarProduccion(orden.id, motivo);
      this.recargarOrdenes();
    }
  }
  crearOrden(): void {
    if (this.ordenForm.invalid) {
      this.ordenForm.markAllAsTouched();
      return;
    }

    const datos: NuevaOrdenProduccion = this.ordenForm.getRawValue();

    this.produccionService.crearOrden(datos);

    this.ordenes = this.produccionService.obtenerOrdenes();
    this.ordenForm.reset({
      productoId: '',
      cantidad: 1,
      observaciones: ''
    });
    this.cerrarFormulario();
  }



}
