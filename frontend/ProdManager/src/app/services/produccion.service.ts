import { Injectable } from '@angular/core';
import { EstadoProductoTerminado, FiltroProductoTerminado, MaterialAgregadoProducto, MovimientoInventario, NuevoProductoFormValue, ProductoTerminado, ResumenInventario } from '../models/producto/producto-terminado.model';
import {
    CampoOrdenOrdenProduccion,
    EstadoOrdenProduccion,
    FiltroOrdenProduccion,
    MaterialRequeridoOrden,
    NuevaOrdenProduccion,
    OrdenamientoOrdenProduccion,
    OrdenProduccion,
    ProductoOrdenProduccion
} from '../models/orden-produccion/orden-produccion.model';
import { ProductoTerminadoService } from './producto-terminado.service';
import { MateriaPrimaService } from './materia-prima.service';
import { UserService } from './user.service';

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

    filtrar(filtros: FiltroOrdenProduccion): OrdenProduccion[] {
        const busqueda = this.normalizar(filtros.busqueda ?? '');

        return this.ordenesProduccion.filter(orden => {
            if (
                busqueda &&
                !this.normalizar(orden.id).includes(busqueda) &&
                !this.normalizar(orden.producto.nombre).includes(busqueda)
            ) {
                return false;
            }

            if (filtros.estado && orden.estado !== filtros.estado) {
                return false;
            }

            if (filtros.productoId && orden.producto.id !== filtros.productoId) {
                return false;
            }

            return true;
        });
    }

    ordenar(
        ordenes: OrdenProduccion[],
        ordenamiento: OrdenamientoOrdenProduccion
    ): OrdenProduccion[] {
        const factor = ordenamiento.direccion === 'asc' ? 1 : -1;

        return [...ordenes].sort(
            (a, b) => this.comparar(a, b, ordenamiento.campo) * factor
        );
    }

    obtenerProductosDeOrdenes(): ProductoOrdenProduccion[] {
        const productos = new Map<string, ProductoOrdenProduccion>();

        for (const orden of this.ordenesProduccion) {
            productos.set(orden.producto.id, orden.producto);
        }

        return [...productos.values()].sort(
            (a, b) => a.nombre.localeCompare(b.nombre, 'es')
        );
    }
    verificarDisponibilidad(id: string): boolean {
        const orden = this.obtenerPorId(id);
        if (!orden) {
            return false;
        }

        orden.materialesRequeridos = this.calcularMaterialesRequeridos(
            orden.producto.id,
            orden.cantidad
        );
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

        const materialesRequeridos =
            this.calcularMaterialesRequeridos(
                datos.productoId,
                datos.cantidad
            );

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
        this.productoTerminadoService.agregarProduccion(
            orden.producto.id,
            orden.cantidadProducida,
            `Orden de producción ${orden.id}`
        );
    }

    cancelarProduccion(id: string, motivo: string): void {
        const orden = this.ordenesProduccion.find(o => o.id === id);
        if (!orden) {
            throw new Error('La orden no existe.');
        }
        if (
            orden.estado === 'finalizada' ||
            orden.estado === 'cancelada'
        ) {
            throw new Error(
                'No se puede cancelar una orden finalizada o ya cancelada.'
            );
        }
        if (!motivo.trim()) {
            throw new Error('Debes indicar un motivo de cancelación.');
        }
        orden.estado = 'cancelada';
        orden.fechaCancelacion = new Date().toISOString();
        orden.historialEstados.push({
            estado: 'cancelada',
            fecha: orden.fechaCancelacion,
            observacion: motivo.trim()
        });

    }

    private comparar(
        a: OrdenProduccion,
        b: OrdenProduccion,
        campo: CampoOrdenOrdenProduccion
    ): number {
        switch (campo) {
            case 'id':
                return a.id.localeCompare(b.id, 'es', { numeric: true });
            case 'producto':
                return a.producto.nombre.localeCompare(b.producto.nombre, 'es');
            case 'cantidad':
                return a.cantidad - b.cantidad;
            case 'estado':
                return (
                    this.flujoEstados.indexOf(a.estado) -
                    this.flujoEstados.indexOf(b.estado)
                );
            case 'fechaCreacion':
                return (
                    this.parsearFecha(a.fechaCreacion) -
                    this.parsearFecha(b.fechaCreacion)
                );
            default:
                return 0;
        }
    }

    private parsearFecha(fecha: string): number {
        const formatoCorto = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(fecha);

        if (formatoCorto) {
            const [, dia, mes, anio] = formatoCorto;
            return new Date(
                Number(anio),
                Number(mes) - 1,
                Number(dia)
            ).getTime();
        }

        const tiempo = new Date(fecha).getTime();
        return Number.isNaN(tiempo) ? 0 : tiempo;
    }

    private normalizar(texto: string): string {
        return texto
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .toLowerCase()
            .trim();
    }

    private calcularMaterialesRequeridos(
        productoId: string,
        cantidadProductos: number
    ): MaterialRequeridoOrden[] {
        const producto = this.productoTerminadoService.obtenerPorId(productoId);

        if (!producto) {
            throw new Error('El producto no existe.');
        }

        return producto.formula.map(detalle => {
            const materiaPrima = this.materiaPrimaService.obtenerPorId(
                detalle.materiaPrimaId
            );

            if (!materiaPrima) {
                throw new Error(
                    `No existe la materia prima ${detalle.nombreMateriaPrima}.`
                );
            }

            const cantidadRequerida =
                detalle.cantidad * cantidadProductos;

            const cantidadDisponible =
                materiaPrima.stockDisponible;

            return {
                materiaPrima: {
                    id: materiaPrima.id,
                    nombre: materiaPrima.nombre,
                    unidadMedida: materiaPrima.unidadMedida
                },
                cantidadRequerida,
                cantidadDisponible,
                disponible:
                    cantidadDisponible >= cantidadRequerida
            };
        });
    }

    private readonly flujoEstados: EstadoOrdenProduccion[] = [
        'pendiente',
        'en_produccion',
        'finalizada',
        'cancelada'
    ];

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
            disponibilidadMateriales: 'insuficiente',
            materialesRequeridos: [
                {
                    materiaPrima: { id: 'M001', nombre: 'Madera de Roble', unidadMedida: 'kg' },
                    cantidadRequerida: 40,
                    cantidadDisponible: 320,
                    disponible: true
                },
                {
                    materiaPrima: { id: 'M003', nombre: 'Tornillos 3mm', unidadMedida: 'u' },
                    cantidadRequerida: 120,
                    cantidadDisponible: 1800,
                    disponible: true
                },
                {
                    materiaPrima: { id: 'M004', nombre: 'Barniz Transparente', unidadMedida: 'L' },
                    cantidadRequerida: 5,
                    cantidadDisponible: 3,
                    disponible: false
                }
            ],
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
            disponibilidadMateriales: 'insuficiente',
            materialesRequeridos: [
                {
                    materiaPrima: { id: 'M001', nombre: 'Madera de Roble', unidadMedida: 'kg' },
                    cantidadRequerida: 30,
                    cantidadDisponible: 320,
                    disponible: true
                },
                {
                    materiaPrima: { id: 'M003', nombre: 'Tornillos 3mm', unidadMedida: 'u' },
                    cantidadRequerida: 100,
                    cantidadDisponible: 1800,
                    disponible: true
                },
                {
                    materiaPrima: { id: 'M004', nombre: 'Barniz Transparente', unidadMedida: 'L' },
                    cantidadRequerida: 3.75,
                    cantidadDisponible: 3,
                    disponible: false
                }
            ],
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
            materialesRequeridos: [
                {
                    materiaPrima: { id: 'M001', nombre: 'Madera de Roble', unidadMedida: 'kg' },
                    cantidadRequerida: 15,
                    cantidadDisponible: 320,
                    disponible: true
                },
                {
                    materiaPrima: { id: 'M003', nombre: 'Tornillos 3mm', unidadMedida: 'u' },
                    cantidadRequerida: 90,
                    cantidadDisponible: 1800,
                    disponible: true
                },
                {
                    materiaPrima: { id: 'M004', nombre: 'Barniz Transparente', unidadMedida: 'L' },
                    cantidadRequerida: 2.25,
                    cantidadDisponible: 3,
                    disponible: true
                }
            ],
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
            materialesRequeridos: [
                {
                    materiaPrima: { id: 'M001', nombre: 'Madera de Roble', unidadMedida: 'kg' },
                    cantidadRequerida: 6,
                    cantidadDisponible: 320,
                    disponible: true
                },
                {
                    materiaPrima: { id: 'M003', nombre: 'Tornillos 3mm', unidadMedida: 'u' },
                    cantidadRequerida: 24,
                    cantidadDisponible: 1800,
                    disponible: true
                },
                {
                    materiaPrima: { id: 'M005', nombre: 'Contrachapado 18mm', unidadMedida: 'planchas' },
                    cantidadRequerida: 2,
                    cantidadDisponible: 45,
                    disponible: true
                }
            ],
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