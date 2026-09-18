import { Component, OnInit } from '@angular/core';
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
    this.recargarOrdenes();
    this.productos = this.productoTerminadoService.obtenerProductosTerminados();
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

    const motivo = this.intervencionForm.controls.observaciones.value;
    const ordenId = this.Ordenseleccionada.id;

    try {
      if (this.accionSeleccionada === 'CANCELAR') {
        this.produccionService.cancelarProduccion(ordenId, motivo);
      } else if (this.accionSeleccionada === 'FINALIZAR') {
        this.produccionService.finalizarProduccion(ordenId);
      }

      this.recargarOrdenes();
      this.cerrarModalIntervencion();
    } catch (error) {
      this.mensajeIntervencionError = error instanceof Error 
        ? error.message 
        : 'Ocurrió un error al procesar la acción.';
    }
  }

  // Helpers y Acciones directas
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

    try {
      if (nuevoEstado === 'en_produccion') {
        this.produccionService.iniciarProduccion(orden.id);
      } else if (nuevoEstado === 'finalizada') {
        this.produccionService.finalizarProduccion(orden.id);
      } else if (nuevoEstado === 'cancelada') {
        const motivo = prompt('Ingrese el motivo de la cancelación:');
        if (motivo) {
          this.produccionService.cancelarProduccion(orden.id, motivo);
        } else {
          throw new Error('Debes indicar un motivo de cancelación.');
        }
      } else {
        throw new Error('El estado seleccionado no es válido.');
      }
    } catch (error) {
      this.mensajeEstadoError = error instanceof Error ? error.message : 'No se pudo cambiar el estado.';
      return;
    }

    this.Ordenseleccionada = this.produccionService.obtenerPorId(orden.id);
    this.recargarOrdenes();
  }

  crearOrden(): void {
    if (this.ordenForm.invalid) {
      this.ordenForm.markAllAsTouched();
      return;
    }

    const datos: NuevaOrdenProduccion = this.ordenForm.getRawValue();

    try {
      this.produccionService.crearOrden(datos);
    } catch (error) {
      this.mensajeError = error instanceof Error ? error.message : 'No se pudo crear la orden.';
      return;
    }

    this.recargarOrdenes();
    this.ordenForm.reset({ productoId: '', cantidad: 1, observaciones: '' });
    this.cerrarFormulario();
  }

  private recargarOrdenes(): void {
    this.ordenes = this.produccionService.obtenerOrdenes();
  }
}