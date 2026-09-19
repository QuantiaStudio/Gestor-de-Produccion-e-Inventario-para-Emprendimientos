import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/services/auth.service';
import { ProductoTerminado, EstadoApiDTO } from '../models/producto/producto-terminado.model';
import {
    DetalleFormulaTablaApiDTO,
    DetalleOrdenProduccionApiDTO,
    EstadoOrdenProduccion,
    MaterialRequeridoOrden,
    NuevaOrdenProduccion,
    OrdenProduccion,
    OrdenProduccionApiDTO
} from '../models/orden-produccion/orden-produccion.model';
import { ProductoTerminadoService } from './producto-terminado.service';
import { MovimientoStockService } from './movimiento-stock.service';
import { MateriaPrimaService } from './materia-prima.service';

interface ItemFormula {
    materiaPrimaId: string;
    nombre: string;
    cantidad: number;
}

@Injectable({
    providedIn: 'root'
})
export class ProduccionService {
    private readonly ordenesUrl = `${environment.apiUrl}/ordenesProduccion`;
    private readonly detallesUrl = `${environment.apiUrl}/detalleOrdenProduccion`;
    private readonly estadosUrl = `${environment.apiUrl}/estados`;
    private readonly formulasUrl = `${environment.apiUrl}/detalleFormula`;
    private readonly productosUrl = `${environment.apiUrl}/productos`;
    private readonly movimientosProductoUrl = `${environment.apiUrl}/movimientosInventarioProducto`;

    private ordenesProduccion: OrdenProduccion[] = [];
    private estados = new Map<number, EstadoOrdenProduccion>();
    private formulas: DetalleFormulaTablaApiDTO[] = [];
    private productos: ProductoTerminado[] = [];

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private materiaPrimaService: MateriaPrimaService,
        private productoTerminadoService: ProductoTerminadoService,
        private movimientoStockService: MovimientoStockService
    ) { }

    cargarOrdenes(): Observable<OrdenProduccion[]> {
        return forkJoin({
            ordenes: this.http.get<OrdenProduccionApiDTO[]>(this.ordenesUrl),
            detalles: this.http.get<DetalleOrdenProduccionApiDTO[]>(this.detallesUrl),
            estados: this.http.get<EstadoApiDTO[]>(this.estadosUrl),
            formulas: this.http.get<DetalleFormulaTablaApiDTO[]>(this.formulasUrl),
            productos: this.productoTerminadoService.cargarProductosTerminados(),
            materias: this.materiaPrimaService.obtenerMateriasPrimas$()
        }).pipe(
            map(({ ordenes, detalles, estados, formulas, productos }) => {
                this.estados = new Map(estados.map(e => [e.id, this.normalizarEstado(e.nombre)]));
                this.formulas = formulas;
                this.productos = productos;
                return ordenes.map(orden => this.mapearOrden(
                    orden,
                    detalles.find(d => d.id_orden === orden.id_orden)
                ));
            }),
            tap(ordenes => this.ordenesProduccion = ordenes)
        );
    }

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

        orden.materialesRequeridos = this.calcularMaterialesRequeridos(
            this.buscarProducto(orden.producto.id),
            orden.cantidad
        );
        const disponible = orden.materialesRequeridos.every(
            material => material.cantidadDisponible >= material.cantidadRequerida
        );
        orden.disponibilidadMateriales = disponible ? 'disponible' : 'insuficiente';
        return disponible;
    }

    crearOrden(datos: NuevaOrdenProduccion): Observable<OrdenProduccion> {
        if (datos.cantidad <= 0) {
            return throwError(() => new Error('La cantidad debe ser mayor a cero.'));
        }

        const operador = this.authService.getUsuarioActual();
        if (!operador) {
            return throwError(() => new Error('No hay un operador autenticado.'));
        }

        const producto = this.buscarProducto(datos.productoId);
        if (!producto || producto.apiId === undefined) {
            return throwError(() => new Error('El producto no existe.'));
        }

        const fechaActual = new Date().toISOString();
        const idOrden = this.proximoIdOrden();
        const idDetalle = this.proximoIdDetalle();
        const materialesRequeridos = this.calcularMaterialesRequeridos(producto, datos.cantidad);

        const ordenApi: OrdenProduccionApiDTO = {
            id: idOrden,
            id_orden: idOrden,
            fecha_creacion: fechaActual,
            id_estado: this.idEstado('pendiente')
        };
        const detalleApi: DetalleOrdenProduccionApiDTO = {
            id: idDetalle,
            id_detalle_produccion: idDetalle,
            id_orden: idOrden,
            id_producto: producto.apiId,
            cantidad_planificada: datos.cantidad,
            cantidad_producida: 0
        };

        return this.http.post<OrdenProduccionApiDTO>(this.ordenesUrl, ordenApi).pipe(
            switchMap(() => this.http.post<DetalleOrdenProduccionApiDTO>(this.detallesUrl, detalleApi)),
            map(() => {
                const nuevaOrden: OrdenProduccion = {
                    id: this.formatearIdOrden(idOrden),
                    apiId: idOrden,
                    detalleApiId: idDetalle,
                    producto: {
                        id: producto.id,
                        nombre: producto.nombre,
                        unidadMedida: producto.unidadMedida || 'unidad'
                    },
                    materialesRequeridos,
                    disponibilidadMateriales: materialesRequeridos.every(m => m.disponible)
                        ? 'disponible'
                        : 'insuficiente',
                    cantidad: datos.cantidad,
                    cantidadProducida: 0,
                    estado: 'pendiente',
                    fechaCreacion: fechaActual,
                    operadorId: String(operador.id),
                    operadorNombre: `${operador.nombre} ${operador.apellido}`,
                    observaciones: datos.observaciones,
                    historialEstados: [{ estado: 'pendiente', fecha: fechaActual }]
                };
                this.ordenesProduccion.push(nuevaOrden);
                return nuevaOrden;
            })
        );
    }

    iniciarProduccion(id: string): Observable<void> {
        const orden = this.ordenesProduccion.find(o => o.id === id);
        if (!orden) {
            return throwError(() => new Error('La orden no existe.'));
        }
        if (orden.estado !== 'pendiente') {
            return throwError(() => new Error('Solo se pueden iniciar órdenes pendientes.'));
        }
        if (!this.verificarDisponibilidad(id)) {
            return throwError(() => new Error('No hay materiales suficientes para iniciar la producción.'));
        }

        const fechaActual = new Date().toISOString();

        return this.http.patch(`${this.ordenesUrl}/${orden.apiId}`, {
            id_estado: this.idEstado('en_produccion'),
            fecha_inicio: fechaActual
        }).pipe(
            tap(() => {
                orden.estado = 'en_produccion';
                orden.fechaInicio = fechaActual;
                orden.historialEstados.push({ estado: 'en_produccion', fecha: fechaActual });
            }),
            map(() => undefined)
        );
    }

    finalizarProduccion(id: string): Observable<void> {
        const orden = this.ordenesProduccion.find(o => o.id === id);
        if (!orden) {
            return throwError(() => new Error('La orden no existe.'));
        }
        if (orden.estado !== 'en_produccion') {
            return throwError(() => new Error('Solo se pueden finalizar órdenes en producción.'));
        }
        if (!this.verificarDisponibilidad(id)) {
            return throwError(() => new Error('No hay materiales suficientes para finalizar la producción.'));
        }

        const producto = this.buscarProducto(orden.producto.id);
        if (!producto || producto.apiId === undefined) {
            return throwError(() => new Error('El producto no existe.'));
        }

        const observacion = `Orden de producción ${orden.id}`;
        const fechaActual = new Date().toISOString();
        const nuevoStockProducto = producto.stockActual + orden.cantidad;

        // Al finalizar se descuenta la materia prima (con su movimiento) y se suma el producto terminado.
        orden.materialesRequeridos.forEach(material => {
            const stockResultante = this.materiaPrimaService.registrarMovimiento(
                material.materiaPrima.id,
                'consumo',
                material.cantidadRequerida
            );
            if (stockResultante !== undefined) {
                this.movimientoStockService.registrarMovimiento(
                    material.materiaPrima.id,
                    'consumo',
                    material.cantidadRequerida,
                    stockResultante,
                    observacion
                );
            }
        });

        const peticiones: Observable<unknown>[] = [
            this.http.patch(`${this.ordenesUrl}/${orden.apiId}`, {
                id_estado: this.idEstado('finalizada')
            }),
            this.http.patch(`${this.productosUrl}/${producto.apiId}`, {
                stock_actual: nuevoStockProducto
            }),
            this.http.post(this.movimientosProductoUrl, {
                fecha: fechaActual,
                tipo_movimiento: 'ingreso',
                cantidad: orden.cantidad,
                id_producto: producto.apiId,
                id_usuario: this.obtenerIdUsuario(),
                observacion
            })
        ];
        if (orden.detalleApiId !== undefined) {
            peticiones.push(this.http.patch(`${this.detallesUrl}/${orden.detalleApiId}`, {
                cantidad_producida: orden.cantidad
            }));
        }

        return forkJoin(peticiones).pipe(
            tap(() => {
                orden.cantidadProducida = orden.cantidad;
                orden.estado = 'finalizada';
                orden.fechaFinalizacion = fechaActual;
                orden.historialEstados.push({ estado: 'finalizada', fecha: fechaActual });
                this.productoTerminadoService.agregarProduccion(
                    orden.producto.id,
                    orden.cantidadProducida,
                    observacion
                );
            }),
            map(() => undefined)
        );
    }

    cancelarProduccion(id: string, motivo: string): Observable<void> {
        const orden = this.ordenesProduccion.find(o => o.id === id);
        if (!orden) {
            return throwError(() => new Error('La orden no existe.'));
        }
        if (orden.estado === 'finalizada' || orden.estado === 'cancelada') {
            return throwError(() => new Error('No se puede cancelar una orden finalizada o ya cancelada.'));
        }
        if (!motivo.trim()) {
            return throwError(() => new Error('Debes indicar un motivo de cancelación.'));
        }

        const fechaActual = new Date().toISOString();

        return this.http.patch(`${this.ordenesUrl}/${orden.apiId}`, {
            id_estado: this.idEstado('cancelada')
        }).pipe(
            tap(() => {
                orden.estado = 'cancelada';
                orden.fechaCancelacion = fechaActual;
                orden.historialEstados.push({
                    estado: 'cancelada',
                    fecha: fechaActual,
                    observacion: motivo.trim()
                });
            }),
            map(() => undefined)
        );
    }

    private mapearOrden(
        orden: OrdenProduccionApiDTO,
        detalle: DetalleOrdenProduccionApiDTO | undefined
    ): OrdenProduccion {
        const producto = detalle ? this.productos.find(p => p.apiId === detalle.id_producto) : undefined;
        const estado = this.estados.get(orden.id_estado) ?? 'pendiente';
        const cantidad = detalle?.cantidad_planificada ?? 0;
        const materialesRequeridos = this.calcularMaterialesRequeridos(producto, cantidad);

        const fechaCreacion = this.aIso(orden.fecha_creacion);
        const fechaInicio = orden.fecha_inicio ? this.aIso(orden.fecha_inicio) : undefined;

        const historialEstados: OrdenProduccion['historialEstados'] = [
            { estado: 'pendiente', fecha: fechaCreacion }
        ];
        if (estado !== 'pendiente' && fechaInicio) {
            historialEstados.push({ estado: 'en_produccion', fecha: fechaInicio });
        }
        if (estado === 'finalizada' || estado === 'cancelada') {
            historialEstados.push({
                estado,
                fecha: '',
                observacion: 'fecha no registrada en la base de datos'
            });
        }

        return {
            id: this.formatearIdOrden(orden.id_orden),
            apiId: orden.id_orden,
            detalleApiId: detalle?.id_detalle_produccion,
            producto: {
                id: producto?.id ?? String(detalle?.id_producto ?? ''),
                nombre: producto?.nombre ?? `Producto #${detalle?.id_producto ?? '?'}`,
                unidadMedida: producto?.unidadMedida || 'unidad'
            },
            cantidad,
            cantidadProducida: detalle?.cantidad_producida ?? 0,
            estado,
            disponibilidadMateriales: materialesRequeridos.every(m => m.disponible)
                ? 'disponible'
                : 'insuficiente',
            materialesRequeridos,
            fechaCreacion,
            fechaInicio,
            historialEstados
        };
    }

    private calcularMaterialesRequeridos(
        producto: ProductoTerminado | undefined,
        cantidadProductos: number
    ): MaterialRequeridoOrden[] {
        return this.obtenerFormula(producto).map(item => {
            const materiaPrima = this.materiaPrimaService.obtenerPorId(item.materiaPrimaId);
            const cantidadRequerida = item.cantidad * cantidadProductos;
            const cantidadDisponible = materiaPrima?.stockDisponible ?? 0;

            return {
                materiaPrima: {
                    id: item.materiaPrimaId,
                    nombre: materiaPrima?.nombre ?? item.nombre,
                    unidadMedida: materiaPrima?.unidadMedida ?? ''
                },
                cantidadRequerida,
                cantidadDisponible,
                disponible: !!materiaPrima && cantidadDisponible >= cantidadRequerida
            };
        });
    }

    // Usa la fórmula del producto y, si no tiene, la tabla detalleFormula de la API.
    private obtenerFormula(producto: ProductoTerminado | undefined): ItemFormula[] {
        if (!producto) {
            return [];
        }
        if (producto.formula.length > 0) {
            return producto.formula.map(f => ({
                materiaPrimaId: String(Number(f.materiaPrimaId.replace(/\D/g, ''))),
                nombre: f.nombreMateriaPrima,
                cantidad: f.cantidad
            }));
        }
        return this.formulas
            .filter(f => f.id_producto === producto.apiId)
            .map(f => ({
                materiaPrimaId: String(f.id_materia_prima),
                nombre: `Materia prima #${f.id_materia_prima}`,
                cantidad: f.cantidad_necesaria
            }));
    }

    private buscarProducto(idProducto: string): ProductoTerminado | undefined {
        return this.productos.find(p => p.id === idProducto)
            ?? this.productoTerminadoService.obtenerPorId(idProducto);
    }

    private obtenerIdUsuario(): number {
        const idUsuario = Number(this.authService.getUsuarioActual()?.id);
        if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
            throw new Error('No hay un usuario autenticado válido.');
        }
        return idUsuario;
    }

    private idEstado(estado: EstadoOrdenProduccion): number {
        const entrada = [...this.estados.entries()].find(([, nombre]) => nombre === estado);
        if (!entrada) {
            throw new Error(`No existe el estado "${estado}" en la base de datos.`);
        }
        return entrada[0];
    }

    private proximoIdOrden(): number {
        return this.ordenesProduccion.reduce((max, o) => Math.max(max, o.apiId ?? 0), 0) + 1;
    }

    private proximoIdDetalle(): number {
        return this.ordenesProduccion.reduce((max, o) => Math.max(max, o.detalleApiId ?? 0), 0) + 1;
    }

    private formatearIdOrden(idOrden: number): string {
        return `OP-${String(idOrden).padStart(3, '0')}`;
    }

    private normalizarEstado(nombre: string): EstadoOrdenProduccion {
        return nombre
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .toLowerCase()
            .replace(/\s+/g, '_') as EstadoOrdenProduccion;
    }

    private aIso(fecha: string): string {
        return fecha.includes(' ') ? fecha.replace(' ', 'T') : fecha;
    }
}
