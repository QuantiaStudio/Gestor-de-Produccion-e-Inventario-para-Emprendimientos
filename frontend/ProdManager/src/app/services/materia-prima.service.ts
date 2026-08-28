import { Injectable } from '@angular/core';
import { MateriaPrima } from '../models/materia-prima/materia-prima.model';

@Injectable({
  providedIn: 'root'
})
export class MateriaPrimaService {
  private materiasPrimas: MateriaPrima[] = [
    {
      id: 'M001', nombre: 'Madera de Roble', categoria: 'Madera',
      unidadMedida: 'kg', stockTotal: 320, stockDisponible: 320, stockMinimo: 50, estado: 'optimo',
      descripcion: 'Madera dura de alta calidad para muebles estructurales.',
      proveedor: 'Maderas del Sur S.A.', ultimaActualizacion: '02/06/2026'
    },
    {
      id: 'M002', nombre: 'Pintura Blanca', categoria: 'Acabados',
      unidadMedida: 'L', stockTotal: 15, stockDisponible: 15, stockMinimo: 20, estado: 'bajo_minimo',
      descripcion: 'Pintura blanca mate para acabado de superficies.',
      proveedor: 'Pinturerías Andina', ultimaActualizacion: '28/05/2026'
    },
    {
      id: 'M003', nombre: 'Tornillos 3mm', categoria: 'Herrajes',
      unidadMedida: 'u', stockTotal: 1800, stockDisponible: 1800, stockMinimo: 500, estado: 'optimo',
      descripcion: 'Tornillos de acero de 3mm para ensamblaje general.',
      proveedor: 'Ferretería Central', ultimaActualizacion: '15/06/2026'
    },
    {
      id: 'M004', nombre: 'Barniz Transparente', categoria: 'Acabados',
      unidadMedida: 'L', stockTotal: 3, stockDisponible: 3, stockMinimo: 10, estado: 'sin_stock',
      descripcion: 'Barniz transparente brillante para protección de madera.',
      proveedor: 'Pinturerías Andina', ultimaActualizacion: '10/06/2026'
    },
    {
      id: 'M005', nombre: 'Contrachapado 18mm', categoria: 'Madera',
      unidadMedida: 'planchas', stockTotal: 45, stockDisponible: 45, stockMinimo: 15, estado: 'optimo',
      descripcion: 'Planchas de contrachapado de 18mm para estructuras.',
      proveedor: 'Maderas del Sur S.A.', ultimaActualizacion: '20/06/2026'
    },
  ];

  obtenerMateriasPrimas(): MateriaPrima[] {
    return this.materiasPrimas;
  }

  obtenerPorId(id: string): MateriaPrima | undefined {
    return this.materiasPrimas.find(mp => mp.id === id);
  }
}
