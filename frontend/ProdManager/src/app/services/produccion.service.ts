import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/services/auth.service';
import { ProductoTerminado } from '../models/producto/producto-terminado.model';
import {
    CampoOrdenOrdenProduccion,
    DetalleOrdenProduccionApiDTO,
    EstadoOrdenApiDTO,
    EstadoOrdenProduccion,
    FiltroOrdenProduccion,
    MaterialRequeridoOrden,
    NuevaOrdenProduccion,
    OrdenamientoOrdenProduccion,
    OrdenProduccion,
    OrdenProduccionApiDTO,
    ProductoOrdenProduccion
} from '../models/orden-produccion/orden-produccion.model';
import { ProductoTerminadoService } from './producto-terminado.service';
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
    private readonly ordenesUrl = `${environment.djangoApiUrl}/ordenes-produccion/`;
    private readonly detallesUrl = `${environment.djangoApiUrl}/detalles-orden-produccion/`;
    private readonly estadosUrl = `${environment.djangoApiUrl}/estados/`;

    private ordenesProduccion: OrdenProduccion[] = [];
    private readonly flujoEstados: EstadoOrdenProduccion[] = [
        'pendiente',
        'en_produccion',
        'finalizada',
        'cancelada'
    ];
    private estados = new Map<number, EstadoOrdenProduccion>();
    private productos: ProductoTerminado[] = [];

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private materiaPrimaService: MateriaPrimaService,
        private productoTerminadoService: ProductoTerminadoService
    ) { }

    cargarOrdenes(): Observable<OrdenProduccion[]> {
        return forkJoin({
            ordenes: this.http.get<OrdenProduccionApiDTO[]>(this.ordenesUrl),
            detalles: this.http.get<DetalleOrdenProduccionApiDTO[]>(this.detallesUrl),
            estados: this.http.get<EstadoOrdenApiDTO[]>(this.estadosUrl),
            productos: this.productoTerminadoService.cargarProductosTerminados(),
            materias: this.materiaPrimaService.obtenerMateriasPrimas$()
        }).pipe(
            map(({ ordenes, detalles, estados, productos }) => {
                this.estados = new Map(estados.map(e => [e.id_estado, this.normalizarEstado(e.nombre)]));
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

        const payload = {
            observaciones: datos.observaciones ?? '',
            detalle: {
                id_producto: producto.apiId,
                cantidad_planificada: datos.cantidad
            }
        };

        return this.http.post<OrdenProduccionApiDTO>(this.ordenesUrl, payload).pipe(
            map(orden => {
                const detalle: DetalleOrdenProduccionApiDTO = {
                    id_detalle_produccion: 0,
                    id_orden: orden.id_orden,
                    id_producto: producto.apiId!,
                    cantidad_planificada: datos.cantidad,
                    cantidad_producida: 0
                };
                return this.mapearOrden(orden, detalle);
            }),
            tap(nuevaOrden => this.ordenesProduccion.unshift(nuevaOrden))
        );
    }

    // Conexión con Endpoint de Inicio y Reserva Atómica en Django
    iniciarProduccion(id: string): Observable<void> {
        const orden = this.ordenesProduccion.find(o => o.id === id);
        if (!orden) {
            return throwError(() => new Error('La orden no existe.'));
        }

        const pk = orden.apiId;
        const url = `${environment.djangoApiUrl}/ordenes/${pk}/iniciar/`;

        return this.http.post<any>(url, {}).pipe(
            tap(() => {
                const fechaActual = new Date().toISOString();
                orden.estado = 'en_produccion';
                orden.fechaInicio = fechaActual;
                orden.historialEstados.push({ estado: 'en_produccion', fecha: fechaActual });
            }),
            map(() => undefined)
        );
    }

    // Conexión con Endpoint de Finalización Transaccional en Django
    finalizarProduccion(id: string): Observable<void> {
        const orden = this.ordenesProduccion.find(o => o.id === id);
        if (!orden) {
            return throwError(() => new Error('La orden no existe.'));
        }

        const pk = orden.apiId;
        const url = `${environment.djangoApiUrl}/ordenes/${pk}/finalizar/`;

        return this.http.post<any>(url, {}).pipe(
            tap(() => {
                const fechaActual = new Date().toISOString();
                orden.cantidadProducida = orden.cantidad;
                orden.estado = 'finalizada';
                orden.fechaFinalizacion = fechaActual;
                orden.historialEstados.push({ estado: 'finalizada', fecha: fechaActual });
            }),
            map(() => undefined)
        );
    }

    // Conexión con Endpoint de Cancelación y Liberación de Reservas en Django
    cancelarProduccion(id: string, motivo: string): Observable<void> {
        const orden = this.ordenesProduccion.find(o => o.id === id);
        if (!orden) {
            return throwError(() => new Error('La orden no existe.'));
        }
        if (!motivo.trim()) {
            return throwError(() => new Error('Debes indicar un motivo de cancelación.'));
        }

        const pk = orden.apiId;
        const url = `${environment.djangoApiUrl}/ordenes/${pk}/cancelar/`;

        return this.http.post<any>(url, { motivo: motivo.trim() }).pipe(
            tap(() => {
                const fechaActual = new Date().toISOString();
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
        const cantidad = Number(detalle?.cantidad_planificada ?? 0);
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
            cantidadProducida: Number(detalle?.cantidad_producida ?? 0),
            estado,
            disponibilidadMateriales: materialesRequeridos.every(m => m.disponible)
                ? 'disponible'
                : 'insuficiente',
            materialesRequeridos,
            fechaCreacion,
            fechaInicio,
            historialEstados,
            operadorId: orden.id_usuario ? String(orden.id_usuario) : undefined,
            operadorNombre: this.nombreOperador(orden.id_usuario),
            observaciones: orden.observaciones
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
        return [];
    }

    private buscarProducto(idProducto: string): ProductoTerminado | undefined {
        return this.productos.find(p => p.id === idProducto)
            ?? this.productoTerminadoService.obtenerPorId(idProducto);
    }

    private formatearIdOrden(idOrden: number): string {
        return `OP-${String(idOrden).padStart(3, '0')}`;
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

    private normalizarEstado(nombre: string): EstadoOrdenProduccion {
        return nombre
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .toLowerCase()
            .replace(/\s+/g, '_') as EstadoOrdenProduccion;
    }

    private nombreOperador(idUsuario: number | null): string | undefined {
        const usuario = this.authService.getUsuarioActual();
        if (!usuario || !idUsuario || Number(usuario.id) !== idUsuario) return undefined;
        return `${usuario.nombre} ${usuario.apellido}`.trim();
    }

    private aIso(fecha: string): string {
        return fecha.includes(' ') ? fecha.replace(' ', 'T') : fecha;
    }
}
