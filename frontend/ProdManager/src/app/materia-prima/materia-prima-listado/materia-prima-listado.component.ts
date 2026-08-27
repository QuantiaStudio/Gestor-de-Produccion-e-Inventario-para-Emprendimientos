import { Component } from '@angular/core';
import { MateriaPrima } from '../materia-prima.model';
import { MateriaPrimaDetalleComponent } from '../materia-prima-detalle/materia-prima-detalle.component';

@Component({
  selector: 'app-materia-prima-listado',
  standalone: true,
  imports: [MateriaPrimaDetalleComponent],
  templateUrl: './materia-prima-listado.component.html',
  styleUrl: './materia-prima-listado.component.css'
})
export class MateriaPrimaListadoComponent {
  materiaPrimaSeleccionada: MateriaPrima | null = null;

  materiasPrimas: MateriaPrima[] = [
    {
      id: 'M001', nombre: 'Madera de Roble', categoria: 'Madera',
      cantidad: 320, unidadMedida: 'kg', stockMinimo: 50, estado: 'Disponible',
      descripcion: 'Madera dura de alta calidad para muebles estructurales.',
      proveedor: 'Maderas del Sur S.A.', ultimaActualizacion: '02/06/2026'
    },
    {
      id: 'M002', nombre: 'Pintura Blanca', categoria: 'Acabados',
      cantidad: 15, unidadMedida: 'L', stockMinimo: 20, estado: 'Bajo stock',
      descripcion: 'Pintura blanca mate para acabado de superficies.',
      proveedor: 'Pinturerías Andina', ultimaActualizacion: '28/05/2026'
    },
    {
      id: 'M003', nombre: 'Tornillos 3mm', categoria: 'Herrajes',
      cantidad: 1800, unidadMedida: 'u', stockMinimo: 500, estado: 'Disponible',
      descripcion: 'Tornillos de acero de 3mm para ensamblaje general.',
      proveedor: 'Ferretería Central', ultimaActualizacion: '15/06/2026'
    },
    {
      id: 'M004', nombre: 'Barniz Transparente', categoria: 'Acabados',
      cantidad: 3, unidadMedida: 'L', stockMinimo: 10, estado: 'Sin stock',
      descripcion: 'Barniz transparente brillante para protección de madera.',
      proveedor: 'Pinturerías Andina', ultimaActualizacion: '10/06/2026'
    },
    {
      id: 'M005', nombre: 'Contrachapado 18mm', categoria: 'Madera',
      cantidad: 45, unidadMedida: 'planchas', stockMinimo: 15, estado: 'Disponible',
      descripcion: 'Planchas de contrachapado de 18mm para estructuras.',
      proveedor: 'Maderas del Sur S.A.', ultimaActualizacion: '20/06/2026'
    },
  ];

  seleccionar(materiaPrima: MateriaPrima) {
    this.materiaPrimaSeleccionada = materiaPrima;
  }

  cerrarDetalle() {
    this.materiaPrimaSeleccionada = null;
  }
}
