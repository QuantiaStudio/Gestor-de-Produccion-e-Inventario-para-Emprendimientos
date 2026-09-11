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

    obtenerOrdenes(): OrdenProduccion[] {
        // Implementación para obtener las órdenes de producción
        return [];
    }
    obtenerPorId(id: string): OrdenProduccion | undefined {
        return this.obtenerOrdenes().find(orden => orden.id === id);
    }
    crearOrden(datos: NuevaOrdenProduccion): OrdenProduccion {
        // Implementación para crear una nueva orden de producción
        return {} as OrdenProduccion;
    }
    verificarDisponibilidad(id: string): boolean {
        // Implementación para verificar la disponibilidad de materiales
        return false;
    }
    iniciarProduccion(id: string): void {
        // Implementación para iniciar la producción
    }
    finalizarProduccion(id: string): void {
        // Implementación para finalizar la producción
    }
    cancelarProduccion(id: string, motivo: string): void {
        // Implementación para cancelar la producción
    }
}