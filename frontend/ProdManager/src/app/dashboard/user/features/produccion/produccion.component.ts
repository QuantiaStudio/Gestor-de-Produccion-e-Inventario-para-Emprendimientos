import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ProduccionService } from '../../../../services/produccion.service';
import { 
  OrdenProduccion, 
  EstadoOrdenProduccion, 
  NuevaOrdenProduccion 
} from '../../../../models/orden-produccion/orden-produccion.model';
import { ProductoTerminado } from '../../../../models/producto/producto-terminado.model';
import { ProductoTerminadoService } from '../../../../services/producto-terminado.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

export type TipoAccionIntervencion = 'CANCELAR' | 'FINALIZAR';

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

  // Controles de Filtros
  filtroTexto = new FormControl('', { nonNullable: true });
  filtroEstado = new FormControl('todos', { nonNullable: true });
  filtroProducto = new FormControl('todos', { nonNullable: true });

  // Formulario para Nueva Orden
  ordenForm!: FormGroup<{
    productoId: FormControl<string>;
    cantidad: FormControl<number>;
    observaciones: FormControl<string>;
  }>;

  // Formulario reactivo para el modal de intervención (TSK-11.1 / 11.3)
  intervencionForm!: FormGroup<{
    observaciones: FormControl<string>;
  }>;
  mensajeIntervencionError = '';

  Ordenseleccionada?: OrdenProduccion;
  mostrarFormulario = false;

  accionSeleccionada: TipoAccionIntervencion | null = null;
  mostrarModalIntervencion = false;

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

    this.intervencionForm = this.formBuilder.nonNullable.group({
      observaciones: ['', [Validators.required, Validators.minLength(5)]]
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

  // Getters para KPIS
  get totalPendientes(): number {
    return this.ordenes.filter(o => o.estado === 'pendiente').length;
  }

  get totalEnProceso(): number {
    return this.ordenes.filter(o => o.estado === 'en_produccion').length;
  }

  get totalFinalizadas(): number {
    return this.ordenes.filter(o => o.estado === 'finalizada').length;
  }

  get totalCanceladas(): number {
    return this.ordenes.filter(o => o.estado === 'cancelada').length;
  }

  // Getters para Filtrado
  get ordenesFiltradas(): OrdenProduccion[] {
    const texto = this.filtroTexto.value.toLowerCase().trim();
    const estado = this.filtroEstado.value;
    const productoId = this.filtroProducto.value;

    return this.ordenes.filter(orden => {
      const coincideTexto = !texto || 
        orden.id.toLowerCase().includes(texto) || 
        orden.producto.nombre.toLowerCase().includes(texto);

      const coincideEstado = estado === 'todos' || orden.estado === estado;
      const coincideProducto = productoId === 'todos' || orden.producto.id === productoId;

      return coincideTexto && coincideEstado && coincideProducto;
    });
  }

  // Métodos de Filtro
  filtrarPorEstado(estado: string): void {
    this.filtroEstado.setValue(estado);
  }

  limpiarFiltros(): void {
    this.filtroTexto.setValue('');
    this.filtroEstado.setValue('todos');
    this.filtroProducto.setValue('todos');
  }

  // Métodos de Navegación / Detalle
  verDetalle(orden: OrdenProduccion): void {
    this.Ordenseleccionada = orden;
    this.mensajeEstadoError = '';
  }

  cerrarDetalle(): void {
    this.Ordenseleccionada = undefined;
    this.mensajeEstadoError = '';
  }

  abrirFormulario(): void {
    this.mensajeError = '';
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mensajeError = '';
    this.mostrarFormulario = false;
  }

  // Modal de Intervención (TSK-11.3)
  abrirModalIntervencion(orden: OrdenProduccion, accion: TipoAccionIntervencion): void {
    this.Ordenseleccionada = orden;
    this.mensajeEstadoError = '';
  }

  cerrarDetalle(): void {
    this.Ordenseleccionada = undefined;
    this.mensajeEstadoError = '';
  }

  contarPorEstado(estado: EstadoOrdenProduccion): number {
    return this.ordenes.filter(orden => orden.estado === estado).length;
  }

  textoEstado(estado: EstadoOrdenProduccion): string {
    const textos: Record<EstadoOrdenProduccion, string> = {
      pendiente: 'Pendiente',
      en_produccion: 'En producción',
      finalizada: 'Finalizada',
      cancelada: 'Cancelada'
    };
    return textos[estado] || estado;
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
        this.recargarOrdenes();
      },
      error: (error) => {
        this.mensajeEstadoError = error instanceof Error && !('status' in error)
          ? error.message
          : 'No se pudo cambiar el estado de la orden.';
      }
    });
  }

  private recargarOrdenes(): void {
    this.ordenes = this.produccionService.obtenerOrdenes();
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

  private recargarOrdenes(): void {
    this.ordenes = this.produccionService.obtenerOrdenes();
  }
}