import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProduccionService } from '../../../../services/produccion.service';
import {
  CampoOrdenOrdenProduccion,
  FiltroOrdenProduccion,
  OrdenamientoOrdenProduccion,
  OrdenProduccion,
  ProductoOrdenProduccion
} from '../../../../models/orden-produccion/orden-produccion.model';
import { ProductoTerminado } from '../../../../models/producto/producto-terminado.model';
import { ProductoTerminadoService } from '../../../../services/producto-terminado.service';
import { NuevaOrdenProduccion } from '../../../../models/orden-produccion/orden-produccion.model';
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
  ordenForm!: FormGroup<{
    productoId: FormControl<string>;
    cantidad: FormControl<number>;
    observaciones: FormControl<string>;
  }>;

  Ordenseleccionada?: OrdenProduccion;

  productosDeOrdenes: ProductoOrdenProduccion[] = [];
  ordenamiento: OrdenamientoOrdenProduccion = {
    campo: 'fechaCreacion',
    direccion: 'desc'
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
    this.productos = this.productoTerminadoService.obtenerProductosTerminados();
    this.refrescar();
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

  direccionDe(campo: CampoOrdenOrdenProduccion): 'ascending' | 'descending' | 'none' {
    if (this.ordenamiento.campo !== campo) {
      return 'none';
    }

    return this.ordenamiento.direccion === 'asc' ? 'ascending' : 'descending';
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
  private refrescar(): void {
    this.ordenes = this.produccionService.ordenar(
      this.produccionService.filtrar(this.filtrosActuales),
      this.ordenamiento
    );
    this.productosDeOrdenes = this.produccionService.obtenerProductosDeOrdenes();

    const seleccionada = this.Ordenseleccionada;

    if (seleccionada && !this.ordenes.some(orden => orden.id === seleccionada.id)) {
      this.Ordenseleccionada = undefined;
    }
  }
  iniciar(orden: OrdenProduccion): void {
    this.produccionService.iniciarProduccion(orden.id);
    this.refrescar();
  }
  finalizar(orden: OrdenProduccion): void {
    this.produccionService.finalizarProduccion(orden.id);
    this.refrescar();
  }
  cancelar(orden: OrdenProduccion): void {
    const motivo = prompt('Ingrese el motivo de la cancelación:');
    if (motivo) {
      this.produccionService.cancelarProduccion(orden.id, motivo);
      this.refrescar();
    }
  }
  crearOrden(): void {
    if (this.ordenForm.invalid) {
      this.ordenForm.markAllAsTouched();
      return;
    }

    const datos: NuevaOrdenProduccion = this.ordenForm.getRawValue();

    this.produccionService.crearOrden(datos);

    this.refrescar();
    this.ordenForm.reset({
      productoId: '',
      cantidad: 1,
      observaciones: ''
    });
    this.cerrarFormulario();
  }



}
