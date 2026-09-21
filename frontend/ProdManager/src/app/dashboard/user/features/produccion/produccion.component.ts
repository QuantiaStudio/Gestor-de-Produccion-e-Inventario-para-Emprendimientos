import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ProduccionService } from '../../../../services/produccion.service';
import { OrdenProduccion } from '../../../../models/orden-produccion/orden-produccion.model';
import { ProductoTerminado } from '../../../../models/producto/producto-terminado.model';
import { ProductoTerminadoService } from '../../../../services/producto-terminado.service';
import {
  CampoOrdenOrdenProduccion,
  EstadoOrdenProduccion,
  FiltroOrdenProduccion,
  NuevaOrdenProduccion,
  OrdenamientoOrdenProduccion,
  ProductoOrdenProduccion
} from '../../../../models/orden-produccion/orden-produccion.model';
import { ProduccionFiltrosComponent } from './produccion-filtros/produccion-filtros.component';
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
  imports: [CommonModule, ReactiveFormsModule, ProduccionFiltrosComponent],
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

  productosDeOrdenes: ProductoOrdenProduccion[] = [];
  totalOrdenes = 0;
  ordenamiento: OrdenamientoOrdenProduccion = {
    campo: 'fechaCreacion',
    direccion: 'desc'
  };
  // Las tarjetas resumen el total, no el subconjunto filtrado.
  conteoPorEstado: Record<EstadoOrdenProduccion, number> = {
    pendiente: 0,
    en_produccion: 0,
    finalizada: 0,
    cancelada: 0
  };
  private filtrosActuales: FiltroOrdenProduccion = {};

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
      next: () => {
        this.refrescar();
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

  aplicarFiltros(filtros: FiltroOrdenProduccion): void {
    this.filtrosActuales = filtros;
    this.refrescar();
  }

  ordenarPor(campo: CampoOrdenOrdenProduccion): void {
    const mismoCampo = this.ordenamiento.campo === campo;

    this.ordenamiento = {
      campo,
      direccion:
        mismoCampo && this.ordenamiento.direccion === 'asc' ? 'desc' : 'asc'
    };

    this.refrescar();
  }

  direccionDe(
    campo: CampoOrdenOrdenProduccion
  ): 'ascending' | 'descending' | 'none' {
    if (this.ordenamiento.campo !== campo) {
      return 'none';
    }

    return this.ordenamiento.direccion === 'asc' ? 'ascending' : 'descending';
  }

  get hayFiltrosActivos(): boolean {
    const { busqueda, estado, productoId } = this.filtrosActuales;

    return Boolean(busqueda?.trim() || estado || productoId);
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

    let cambio$: Observable<void>;

    if (nuevoEstado === 'en_produccion') {
      cambio$ = this.produccionService.iniciarProduccion(orden.id);
    } else if (nuevoEstado === 'finalizada') {
      cambio$ = this.produccionService.finalizarProduccion(orden.id);
    } else if (nuevoEstado === 'cancelada') {
      if (orden.estado === 'finalizada' || orden.estado === 'cancelada') {
        this.mensajeEstadoError = 'No se puede cancelar una orden finalizada o ya cancelada.';
        return;
      }
      const motivo = prompt('Ingrese el motivo de la cancelación:');
      if (!motivo) {
        this.mensajeEstadoError = 'Debes indicar un motivo de cancelación.';
        return;
      }
      cambio$ = this.produccionService.cancelarProduccion(orden.id, motivo);
    } else if (nuevoEstado === 'pendiente') {
      this.mensajeEstadoError = 'No se puede regresar una orden al estado pendiente.';
      return;
    } else {
      this.mensajeEstadoError = 'El estado seleccionado no es válido.';
      return;
    }

    cambio$.subscribe({
      next: () => {
        this.Ordenseleccionada = this.produccionService.obtenerPorId(orden.id);
        this.refrescar();
      },
      error: (error) => {
        this.mensajeEstadoError = error instanceof Error && !('status' in error)
          ? error.message
          : 'No se pudo cambiar el estado de la orden.';
      }
    });
  }

  private refrescar(): void {
    const todas = this.produccionService.obtenerOrdenes();

    this.ordenes = this.produccionService.ordenar(
      this.produccionService.filtrar(this.filtrosActuales),
      this.ordenamiento
    );
    this.productosDeOrdenes = this.produccionService.obtenerProductosDeOrdenes();
    this.totalOrdenes = todas.length;
    this.conteoPorEstado = {
      pendiente: this.contar(todas, 'pendiente'),
      en_produccion: this.contar(todas, 'en_produccion'),
      finalizada: this.contar(todas, 'finalizada'),
      cancelada: this.contar(todas, 'cancelada')
    };

    const seleccionada = this.Ordenseleccionada;

    if (
      seleccionada &&
      !this.ordenes.some(orden => orden.id === seleccionada.id)
    ) {
      this.cerrarDetalle();
    }
  }

  private contar(
    ordenes: OrdenProduccion[],
    estado: EstadoOrdenProduccion
  ): number {
    return ordenes.filter(orden => orden.estado === estado).length;
  }

  crearOrden(): void {
    if (this.ordenForm.invalid) {
      this.ordenForm.markAllAsTouched();
      return;
    }

    const datos: NuevaOrdenProduccion = this.ordenForm.getRawValue();

    this.produccionService.crearOrden(datos).subscribe({
      next: () => {
        this.refrescar();
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
