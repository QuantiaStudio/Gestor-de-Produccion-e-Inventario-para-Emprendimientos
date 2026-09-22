import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription, merge } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ProduccionService } from '../../../../services/produccion.service';
import { 
  OrdenProduccion, 
  CampoOrdenOrdenProduccion,
  EstadoOrdenProduccion, 
  FiltroOrdenProduccion,
  NuevaOrdenProduccion,
  OrdenamientoOrdenProduccion
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
export class ProduccionComponent implements OnInit, OnDestroy {
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

  // Listado que ve el operador: filtrado y ordenado por el servicio.
  ordenesFiltradas: OrdenProduccion[] = [];
  ordenamiento: OrdenamientoOrdenProduccion = {
    campo: 'fechaCreacion',
    direccion: 'desc'
  };
  private cambiosDeFiltro?: Subscription;

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
    this.cambiosDeFiltro = merge(
      this.filtroTexto.valueChanges,
      this.filtroEstado.valueChanges,
      this.filtroProducto.valueChanges
    ).subscribe(() => this.refrescar());

    this.produccionService.cargarOrdenes().subscribe({
      next: (ordenes) => {
        this.ordenes = ordenes;
        this.refrescar();
      },
      error: (error) => {
        console.error('Error al cargar órdenes de producción', error);
        this.ordenes = [];
        this.refrescar();
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

  // El servicio resuelve el filtrado, con busqueda insensible a acentos,
  // y el ordenamiento, que respeta el flujo natural de los estados.
  private refrescar(): void {
    this.ordenesFiltradas = this.produccionService.ordenar(
      this.produccionService.filtrar(this.filtrosActuales),
      this.ordenamiento
    );

    const seleccionada = this.Ordenseleccionada;

    if (
      seleccionada &&
      !this.ordenesFiltradas.some(orden => orden.id === seleccionada.id)
    ) {
      this.cerrarDetalle();
    }
  }

  private get filtrosActuales(): FiltroOrdenProduccion {
    const estado = this.filtroEstado.value;
    const productoId = this.filtroProducto.value;

    return {
      busqueda: this.filtroTexto.value,
      estado: estado === 'todos' ? undefined : (estado as EstadoOrdenProduccion),
      productoId: productoId === 'todos' ? undefined : productoId
    };
  }

  get totalOrdenes(): number {
    return this.ordenes.length;
  }

  get hayFiltrosActivos(): boolean {
    return Boolean(
      this.filtroTexto.value.trim() ||
      this.filtroEstado.value !== 'todos' ||
      this.filtroProducto.value !== 'todos'
    );
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

  ngOnDestroy(): void {
    this.cambiosDeFiltro?.unsubscribe();
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

  // Modal de Intervención (TSK-11.1 / TSK-11.3)
  abrirModalIntervencion(orden: OrdenProduccion, accion: TipoAccionIntervencion): void {
    this.Ordenseleccionada = orden;
    this.accionSeleccionada = accion;
    this.mensajeIntervencionError = '';
    this.intervencionForm.reset();
    this.mostrarModalIntervencion = true;
  }

  cerrarModalIntervencion(): void {
    this.mostrarModalIntervencion = false;
    this.accionSeleccionada = null;
    this.mensajeIntervencionError = '';
    this.intervencionForm.reset();
  }

  confirmarIntervencion(): void {
    if (this.intervencionForm.invalid || !this.Ordenseleccionada || !this.accionSeleccionada) {
      this.intervencionForm.markAllAsTouched();
      return;
    }

    const motivo = this.intervencionForm.get('observaciones')?.value || '';
    const nuevoEstado = this.accionSeleccionada === 'CANCELAR' ? 'cancelada' : 'finalizada';

    this.produccionService.cancelarProduccion(this.Ordenseleccionada.id, motivo).subscribe({
      next: () => {
        this.recargarOrdenes();
        this.cerrarModalIntervencion();
      },
      error: (err) => {
        console.error('Error al intervenir la orden:', err);
        this.mensajeIntervencionError = 'No se pudo procesar la solicitud.';
      }
    });
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

  crearOrden(): void {
    if (this.ordenForm.invalid) {
      this.ordenForm.markAllAsTouched();
      return;
    }

    const datos: NuevaOrdenProduccion = this.ordenForm.getRawValue();

    this.produccionService.crearOrden(datos).subscribe({
      next: () => {
        this.recargarOrdenes();
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
    this.produccionService.cargarOrdenes().subscribe({
      next: (ordenes) => {
        this.ordenes = ordenes;
        this.refrescar();
      },
      error: (err) => console.error('Error al recargar órdenes:', err)
    });
  }
}