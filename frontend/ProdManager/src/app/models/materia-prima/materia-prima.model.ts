export type EstadoMateriaPrima = 'optimo' | 'bajo_minimo' | 'sin_stock';

/**
 * Forma real de la tabla "materiasPrimas" en db.json (json-server).
 * No incluye categoría ni proveedor: no forman parte del modelo de datos del equipo.
 * ultimaActualizacion se calcula en el service a partir de los movimientos de stock.
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
  unidadMedida: string;
  stockTotal: number;
  stockDisponible: number;
  stockMinimo: number;
  estado: EstadoMateriaPrima;
  descripcion: string;
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
