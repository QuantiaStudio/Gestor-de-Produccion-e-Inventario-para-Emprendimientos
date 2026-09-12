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
  Ordenseleccionada?: OrdenProduccion;

  constructor(private produccionService: ProduccionService) {}

  ngOnInit(): void {
    this.ordenes = this.produccionService.obtenerOrdenes();
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
  
}
