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
