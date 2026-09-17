export type EstadoMateriaPrima = 'optimo' | 'bajo_minimo' | 'sin_stock';

/**
 * Forma real de la tabla "materiasPrimas" en db.json (json-server).
 * No incluye categoria/proveedor/ultimaActualizacion: esos campos todavía
 * no existen en la base de datos del equipo, se completan por defecto en
 * el service hasta que se sumen al modelo relacional real.
 */
export interface MateriaPrimaApi {
  id_materia_prima: number;
  nombre: string;
  descripcion: string;
  unidad_medida: string;
  stock_actual: number;
  stock_minimo: number;
}

export interface MateriaPrima {
  id: string;
  nombre: string;
  categoria: string;
  unidadMedida: string;
  stockTotal: number;
  stockDisponible: number;
  stockMinimo: number;
  estado: EstadoMateriaPrima;
  descripcion: string;
  proveedor: string;
  ultimaActualizacion: string;
}

export type TipoMovimientoStock = 'ingreso' | 'consumo';

/** Forma real de la tabla "movimientosStockMateriaPrima" en db.json (json-server). */
export interface MovimientoStockApi {
  id_movimiento: number;
  id_materia_prima: number;
  fecha: string;
  tipo_movimiento: TipoMovimientoStock;
  cantidad: number;
  observacion: string;
  id_usuario: number;
}

export interface MovimientoStock {
  id: string;
  materiaPrimaId: string;
  fecha: string;
  tipo: TipoMovimientoStock;
  cantidad: number;
  stockResultante: number;
}
