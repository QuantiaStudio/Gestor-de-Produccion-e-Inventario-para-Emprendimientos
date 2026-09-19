import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProduccionService } from '../../../../services/produccion.service';
import { OrdenProduccion } from '../../../../models/orden-produccion/orden-produccion.model';
import { ProductoTerminado } from '../../../../models/producto/producto-terminado.model';
import { ProductoTerminadoService } from '../../../../services/producto-terminado.service';
import {
  EstadoOrdenProduccion,
  NuevaOrdenProduccion
} from '../../../../models/orden-produccion/orden-produccion.model';
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
  mensajeError = '';
  mensajeEstadoError = '';
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
    this.produccionService.cargarOrdenes().subscribe({
      next: (ordenes) => {
        this.ordenes = ordenes;
      },
      error: (error) => {
        console.error('Error al cargar órdenes de producción', error);
        this.ordenes = [];
      }
    });
    this.productoTerminadoService.cargarProductosTerminados().subscribe({
      next: (productos) => {
        this.productos = productos;
      },
      error: (error) => {
        console.error('Error al cargar productos para producción', error);
        this.productos = [];
      }
    });
  }

  get productoId(): FormControl<string> {
    return this.ordenForm.controls.productoId;
  }

  get cantidad(): FormControl<number> {
    return this.ordenForm.controls.cantidad;
  }

  get observaciones(): FormControl<string> {
    return this.ordenForm.controls.observaciones;
  }

  mostrarFormulario = false;

  abrirFormulario(): void {
    this.mensajeError = '';
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mensajeError = '';
    this.mostrarFormulario = false;
  }

  seleccionarOrden(orden: OrdenProduccion): void {
    this.Ordenseleccionada = orden;
    this.mensajeEstadoError = '';
  }

  cerrarDetalle(): void {
    this.Ordenseleccionada = undefined;
    this.mensajeEstadoError = '';
  }

  textoEstado(estado: EstadoOrdenProduccion): string {
    const textos: Record<EstadoOrdenProduccion, string> = {
      pendiente: 'Pendiente',
      en_produccion: 'En producción',
      finalizada: 'Finalizada',
      cancelada: 'Cancelada'
    };

    return textos[estado];
  }

  cambiarEstado(orden: OrdenProduccion, nuevoEstado: string): void {
    this.mensajeEstadoError = '';

    try {
      if (
        nuevoEstado === 'cancelada' &&
        (orden.estado === 'finalizada' || orden.estado === 'cancelada')
      ) {
        throw new Error(
          'No se puede cancelar una orden finalizada o ya cancelada.'
        );
      }

      if (nuevoEstado === 'en_produccion') {
        this.iniciar(orden);
      } else if (nuevoEstado === 'finalizada') {
        this.finalizar(orden);
      } else if (nuevoEstado === 'cancelada') {
        this.cancelar(orden);
      } else if (nuevoEstado === 'pendiente') {
        throw new Error(
          'No se puede regresar una orden al estado pendiente.'
        );
      } else {
        throw new Error('El estado seleccionado no es válido.');
      }
    } catch (error) {
      this.mensajeEstadoError = error instanceof Error
        ? error.message
        : 'No se pudo cambiar el estado de la orden.';
      return;
    }

    this.Ordenseleccionada = this.produccionService.obtenerPorId(orden.id);
    this.recargarOrdenes();
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
    } else {
      throw new Error('Debes indicar un motivo de cancelación.');
    }
  }
  crearOrden(): void {
    if (this.ordenForm.invalid) {
      this.ordenForm.markAllAsTouched();
      return;
    }

    const datos: NuevaOrdenProduccion = this.ordenForm.getRawValue();

    this.produccionService.crearOrden(datos).subscribe({
      next: () => {
        this.ordenes = this.produccionService.obtenerOrdenes();
        this.ordenForm.reset({
          productoId: '',
          cantidad: 1,
          observaciones: ''
        });
        this.cerrarFormulario();
      },
      error: (error) => {
        this.mensajeError = error instanceof Error && !('status' in error)
          ? error.message
          : 'No se pudo crear la orden de producción.';
      }
    });
  }



}
