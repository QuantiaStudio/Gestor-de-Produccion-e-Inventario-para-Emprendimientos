import { Injectable } from '@angular/core';
import { EstadoProductoTerminado, FiltroProductoTerminado, MaterialAgregadoProducto, MovimientoInventario, NuevoProductoFormValue, ProductoTerminado, ResumenInventario } from '../models/producto/producto-terminado.model';
import { NuevaOrdenProduccion, OrdenProduccion } from '../models/orden-produccion/orden-produccion.model';
import { ProductoTerminadoService } from './producto-terminado.service';
import { MateriaPrimaService } from './materia-prima.service';
import { UserService } from './user.service';
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
        private userService: UserService,
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

        const disponible = orden.materialesRequeridos.every(
            material => material.cantidadDisponible >= material.cantidadRequerida
        );
        orden.disponibilidadMateriales = disponible ? 'disponible' : 'insuficiente';
        return disponible;
    }
    private generarNuevoId(): string {
        return `OP-${String(this.ordenesProduccion.length + 1).padStart(3, '0')}`;
    }
    crearOrden(datos: NuevaOrdenProduccion): OrdenProduccion {

        if (datos.cantidad <= 0) {
            throw new Error('La cantidad debe ser mayor a cero.');
        }

        const fechaActual = new Date().toISOString();

        const operador = this.userService.getCurrentUser();

        if (!operador) {
            throw new Error('No hay un operador autenticado.');
        }

        const producto = this.productoTerminadoService.obtenerPorId(datos.productoId);

        if (!producto) {
            throw new Error('El producto no existe.');
        }

        const materialesRequeridos = producto.formula.map(detalle => {
            const materiaPrima = this.materiaPrimaService.obtenerPorId(
                detalle.materiaPrimaId
            );

            if (!materiaPrima) {
                throw new Error(
                    `No existe la materia prima ${detalle.nombreMateriaPrima}.`
                );
            }

            const cantidadRequerida = detalle.cantidad * datos.cantidad;
            const cantidadDisponible = materiaPrima.stockDisponible;

            return {
                materiaPrima: {
                    id: materiaPrima.id,
                    nombre: materiaPrima.nombre,
                    unidadMedida: materiaPrima.unidadMedida
                },
                cantidadRequerida,
                cantidadDisponible,
                disponible: cantidadDisponible >= cantidadRequerida
            };
        });

        const nuevaOrden: OrdenProduccion = {
            id: this.generarNuevoId(),
            producto: {
                id: producto.id,
                nombre: producto.nombre,
                unidadMedida: producto.unidadMedida
            },
            materialesRequeridos,
            disponibilidadMateriales: materialesRequeridos.every(
                material => material.disponible
            )
                ? 'disponible'
                : 'insuficiente',
            cantidad: datos.cantidad,
            cantidadProducida: 0,
            estado: 'pendiente',
            fechaCreacion: fechaActual,
            operadorId: String(operador.id),
            operadorNombre: `${operador.firstName} ${operador.lastName}`,
            observaciones: datos.observaciones,
            historialEstados: [
                {
                    estado: 'pendiente',
                    fecha: fechaActual
                }
            ]
        };
        this.ordenesProduccion.push(nuevaOrden);
        return nuevaOrden;
    }
    iniciarProduccion(id: string): void {
        // Implementación para iniciar la producción
        const orden = this.ordenesProduccion.find(o => o.id === id);
        if (!orden) {
            throw new Error('La orden no existe.');
        }
        if (orden.estado !== 'pendiente') {
            throw new Error('Solo se pueden iniciar órdenes pendientes.');
        }
        const disponible = this.verificarDisponibilidad(id);
        if (!disponible) {
            throw new Error('No hay materiales suficientes para iniciar la producción.');
        }
        const fechaActual = new Date().toISOString();

        orden.estado = 'en_produccion';
        orden.fechaInicio = fechaActual;

        orden.historialEstados.push({
            estado: 'en_produccion',
            fecha: fechaActual
        });
    }
    finalizarProduccion(id: string): void {
        const orden = this.ordenesProduccion.find(o => o.id === id);
        if (!orden) {
            throw new Error('La orden no existe.');
        }
        if (orden.estado !== 'en_produccion') {
            throw new Error('Solo se pueden finalizar órdenes en producción.');
        }
        orden.cantidadProducida = orden.cantidad;
        orden.estado = 'finalizada';
        orden.fechaFinalizacion = new Date().toISOString();
        orden.historialEstados.push({
            estado: 'finalizada',
            fecha: orden.fechaFinalizacion
        });
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