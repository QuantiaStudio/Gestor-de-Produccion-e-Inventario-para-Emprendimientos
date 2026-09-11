import { Injectable } from '@angular/core';
import { EstadoProductoTerminado, FiltroProductoTerminado, MaterialAgregadoProducto, MovimientoInventario, NuevoProductoFormValue, ProductoTerminado, ResumenInventario } from '../models/producto/producto-terminado.model';
import { NuevaOrdenProduccion, OrdenProduccion } from '../models/orden-produccion/orden-produccion.model';
import { ProductoTerminadoService } from './producto-terminado.service';
import { MateriaPrimaService } from './materia-prima.service';
import type {
    CambioEstadoOrdenProduccion,
    EstadoDisponibilidadMaterial,
    EstadoOrdenProduccion,
    MaterialRequeridoOrden,
    ProductoOrdenProduccion
} from '../models/orden-produccion/orden-produccion.model';
@Injectable({
    providedIn: 'root'
})
export class ProduccionService {

    constructor(
        private materiaPrimaService: MateriaPrimaService,
        private productoTerminadoService: ProductoTerminadoService
    ) { }

    obtenerOrdenes(): OrdenProduccion[] {
        return [...this.ordenesProduccion];
    }
    obtenerPorId(id: string): OrdenProduccion | undefined {
        return this.obtenerOrdenes().find(orden => orden.id === id);
    }
    verificarDisponibilidad(id: string): boolean {
        const orden = this.obtenerPorId(id);
        if (!orden) {
            return false;
        }
        return orden.materialesRequeridos.every(
            material => material.cantidadDisponible >= material.cantidadRequerida
        );
    }
    private ordenesProduccion: OrdenProduccion[] = [
        {
            id: 'OP-001',
            producto: {
                id: 'PT-001',
                nombre: 'Mesa Nórdica',
                unidadMedida: 'unidad'
            },
            cantidad: 10,
            cantidadProducida: 0,
            estado: 'en_produccion',
            disponibilidadMateriales: 'disponible',
            materialesRequeridos: [],
            fechaCreacion: '10/09/2026',
            historialEstados: [
                {
                    estado: 'pendiente',
                    fecha: '10/09/2026'
                }
            ]
        },
        {
            id: 'OP-002',
            producto: {
                id: 'PT-002',
                nombre: 'Biblioteca Moderna',
                unidadMedida: 'unidad'
            },
            cantidad: 5,
            cantidadProducida: 5,
            estado: 'finalizada',
            disponibilidadMateriales: 'disponible',
            materialesRequeridos: [],
            fechaCreacion: '03/06/2026',
            historialEstados: [
                {
                    estado: 'pendiente',
                    fecha: '03/06/2026',
                },
                {
                    estado: 'en_produccion',
                    fecha: '03/06/2026'
                },
                {
                    estado: 'finalizada',
                    fecha: '05/06/2026'
                }
            ]
        },
        {
            id: 'OP-003',
            producto: {
                id: 'PT-008',
                nombre: 'Silla Nordica',
                unidadMedida: 'unidad'
            },
            cantidad: 15,
            cantidadProducida: 0,
            estado: 'pendiente',
            disponibilidadMateriales: 'disponible',
            materialesRequeridos: [],
            fechaCreacion: '08/06/2026',
            historialEstados: [
                {
                    estado: 'pendiente',
                    fecha: '08/06/2026'
                }
            ]
        },
        {
            id: 'OP-004',
            producto: {
                id: 'PT-010',
                nombre: 'Escritorio Minimalsita',
                unidadMedida: 'unidad'
            },
            cantidad: 2,
            cantidadProducida: 0,
            estado: 'cancelada',
            disponibilidadMateriales: 'disponible',
            materialesRequeridos: [],
            fechaCreacion: '04/06/2026',
            historialEstados: [
                {
                    estado: 'pendiente',
                    fecha: '04/06/2026'
                },
                {
                    estado: 'cancelada',
                    fecha: '05/06/2026'
                }
            ]
        }
    ];
}