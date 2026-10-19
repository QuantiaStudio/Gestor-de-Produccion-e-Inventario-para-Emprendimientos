export type EstadoMateriaPrima = 'optimo' | 'bajo_minimo' | 'sin_stock';

/**
 * Materia prima tal como la devuelve el backend Django en /api/v1/materias-primas/ (backend/API.md §6.1).
 * No incluye categoría ni proveedor: no forman parte del modelo de datos del equipo.
 * ultimaActualizacion se completa en el service cuando exista un endpoint de movimientos.
 */
export interface MateriaPrimaBackendDTO {
  id_materia_prima: number;
  nombre: string;
  descripcion: string;
  unidad_medida: string;
  // DRF serializa los DecimalField como string para no perder precisión.
  stock_actual: string;
  stock_minimo: string;
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
