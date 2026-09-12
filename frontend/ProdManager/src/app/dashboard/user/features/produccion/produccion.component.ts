import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProduccionService } from '../../../../services/produccion.service';
import { OrdenProduccion } from '../../../../models/orden-produccion/orden-produccion.model';

@Component({
  selector: 'app-produccion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './produccion.component.html',
  styleUrl: './produccion.component.css'
})
export class ProduccionComponent implements OnInit {
  ordenes: OrdenProduccion[] = [];
  productos: ProductoTerminado[] = [];

    cantidad: [1, [Validators.required, Validators.min(1)]],
    observaciones: ['']
  });

  Ordenseleccionada?: OrdenProduccion;

  constructor(private produccionService: ProduccionService, private formBuilder: FormBuilder, private productoTerminadoService: ProductoTerminadoService) { }

  ngOnInit(): void {
    this.ordenes = this.produccionService.obtenerOrdenes();
    this.productos = this.productoTerminadoService.obtenerProductosTerminados();
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
  }



}
