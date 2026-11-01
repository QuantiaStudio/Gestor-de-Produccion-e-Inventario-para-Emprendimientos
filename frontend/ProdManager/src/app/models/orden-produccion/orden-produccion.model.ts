import type { ProductoTerminado } from '../producto/producto-terminado.model';
import type { MateriaPrima } from '../materia-prima/materia-prima.model';

export type EstadoOrdenProduccion =
    | 'pendiente'
    | 'en_produccion'
    | 'finalizada'
    | 'cancelada';

export type EstadoDisponibilidadMaterial =
    | 'disponible'
    | 'insuficiente';

export type MateriaPrimaOrden = Pick<
    MateriaPrima,
    'id' | 'nombre' | 'unidadMedida'
>;

export interface MaterialRequeridoOrden {
    materiaPrima: MateriaPrimaOrden;
    cantidadRequerida: number;
    cantidadDisponible: number;
    disponible: boolean;
}

export interface CambioEstadoOrdenProduccion {
    estado: EstadoOrdenProduccion;
    fecha: string;
    usuarioId?: string;
    usuarioNombre?: string;
    observacion?: string;
}

export type ProductoOrdenProduccion = Pick<
    ProductoTerminado,
    'id' | 'nombre' | 'unidadMedida'
>;

export interface OrdenProduccion {
    id: string;
    apiId?: number;
    detalleApiId?: number;
    producto: ProductoOrdenProduccion;
    cantidad: number;
    cantidadProducida: number;
    estado: EstadoOrdenProduccion;
    disponibilidadMateriales: EstadoDisponibilidadMaterial;
    materialesRequeridos: MaterialRequeridoOrden[];
    fechaCreacion: string;
    fechaInicio?: string;
    fechaFinalizacion?: string;
    fechaCancelacion?: string;
    operadorId?: string;
    operadorNombre?: string;
    observaciones?: string;
    historialEstados: CambioEstadoOrdenProduccion[];
}

export interface NuevaOrdenProduccion {
    productoId: string;
    cantidad: number;
    observaciones?: string;
}

/** Orden de producción del API Django. */
export interface OrdenProduccionApiDTO {
    id_orden: number;
    fecha_creacion: string;
    fecha_inicio: string | null;
    id_estado: number;
    id_usuario: number | null;
    observaciones: string;
}

/** Detalle de orden de producción del API Django. */
export interface DetalleOrdenProduccionApiDTO {
    id_detalle_produccion: number;
    id_orden: number;
    id_producto: number;
    cantidad_planificada: number | string;
    cantidad_producida: number | string;
}

export interface EstadoOrdenApiDTO {
    id_estado: number;
    nombre: string;
}

export interface FiltroOrdenProduccion {
    busqueda?: string;
    estado?: EstadoOrdenProduccion;
    productoId?: string;
}

export type CampoOrdenOrdenProduccion =
    | 'id'
    | 'producto'
    | 'cantidad'
    | 'estado'
    | 'fechaCreacion';

export type DireccionOrden = 'asc' | 'desc';

export interface OrdenamientoOrdenProduccion {
    campo: CampoOrdenOrdenProduccion;
    direccion: DireccionOrden;
}
