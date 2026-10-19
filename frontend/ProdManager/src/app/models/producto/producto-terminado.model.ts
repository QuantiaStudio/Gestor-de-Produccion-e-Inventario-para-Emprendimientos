import type { DetalleFormula } from '../formula/formula.module';

export type EstadoProductoTerminado =
  | 'pendiente'
  | 'en_produccion'
  | 'finalizado'
  | 'cancelado';

export type EstadoInventarioProducto = 'optimo' | 'bajo_minimo' | 'sin_stock';

export type TipoMovimiento = 'ingreso' | 'egreso' | 'ajuste' | 'modificacion';

export interface MovimientoInventario {
  id: string;
  fecha: string;
  tipo: TipoMovimiento;
  cantidad: number;
  origen: string;
  stockResultante: number;
}

export interface ProductoTerminado {
  id: string;
  apiId?: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  categoria: string;
  unidadMedida: string;
  stockActual: number;
  stockMinimo: number;
  stockMaximo: number;
  estado: EstadoProductoTerminado;
  ultimaActualizacion: string;
  lote?: string;
  fechaVencimiento?: string;
  formula: DetalleFormula[];
  movimientos: MovimientoInventario[];
}

export interface FiltroProductoTerminado {
  busqueda?: string;
  categoria?: string;
  estado?: EstadoProductoTerminado | EstadoInventarioProducto;
}

export interface ActualizacionStock {
  id: string;
  stockActual: number;
  stockMinimo: number;
}

export interface ResumenInventario {
  totalProductos: number;
  unidadesEnStock: number;
  bajoMinimo: number;
  sinStock: number;
  enAlerta: number;
}

export interface MaterialAgregadoProducto {
  materiaPrimaId: string;
  nombre: string;
  cantidadMaterial: number;
  unidad: string;
}

export interface NuevoProductoFormValue {
  codigo: string | null;
  nombre: string | null;
  categoria: string | null;
  estado: EstadoProductoTerminado | null;
  stockInicial: number | null;
  stockMinimo: number | null;
  stockMaximo: number | null;
  descripcion: string | null;
  imagen?: string | null;
}

export interface NuevoProducto {
  codigo: string;
  nombre: string;
  categoria: string;
  stockInicial: number;
  descripcion?: string;
  formula: DetalleFormula[];
}

export interface DetalleFormulaApiDTO {
  id_materia_prima: number;
  nombre_materia_prima: string;
  cantidad: number;
}

export interface ProductoApiDTO {
  id?: number;
  codigo?: string;
  nombre: string;
  descripcion: string;
  stock_actual: number;
  stock_minimo?: number;
  stock_maximo?: number;
  id_categoria: number;
  estado: boolean | EstadoProductoTerminado;
  formula?: DetalleFormulaApiDTO[];
  imagen?: string;
}

export interface CategoriaApiDTO {
  id: number;
  nombre: string;
}

export interface EstadoApiDTO {
  id: number;
  nombre: string;
}

export interface MovimientoInventarioApiDTO {
  id_movimiento_producto?: number;
  fecha: string;
  tipo_movimiento: string;
  cantidad: number;
  id_producto: number;
  id_usuario?: number;
  observacion?: string;
}

/** Estados de un producto en el backend Django (backend/API.md §7.2). */
export type EstadoProductoBackend = 'activo' | 'inactivo' | 'en_produccion' | 'pendiente';

/** Categoría tal como la devuelve el backend Django (backend/API.md §7.1). */
export interface CategoriaBackendDTO {
  id_categoria: number;
  nombre: string;
}

/** Línea de la fórmula de un producto en el backend Django (backend/API.md §7.2). */
export interface LineaFormulaBackendDTO {
  id_detalle_formula?: number;
  id_materia_prima: number;
  cantidad_necesaria: number | string;
}

/**
 * Producto con su fórmula en el backend Django (backend/API.md §7.2).
 * Al crear se envían los campos editables; la respuesta agrega id_producto, stock_actual
 * y el id de cada línea. Los decimales se envían como número y vuelven como string.
 */
export interface ProductoBackendDTO {
  id_producto?: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: number | string;
  estado: EstadoProductoBackend;
  stock_actual?: string;
  stock_minimo: number | string;
  stock_maximo: number | string | null;
  imagen: string;
  id_categoria: number;
  formula: LineaFormulaBackendDTO[];
}
