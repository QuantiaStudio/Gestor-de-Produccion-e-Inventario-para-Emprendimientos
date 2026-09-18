import type { DetalleFormula } from '../formula/formula.module';

export type EstadoProductoTerminado =
  | 'pendiente'
  | 'en_produccion'
  | 'finalizado'
  | 'cancelado';

export type TipoMovimiento = 'ingreso' | 'egreso' | 'ajuste';

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
  estado?: EstadoProductoTerminado;
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
  stockInicial: number | null;
  stockMinimo: number | null;
  stockMaximo: number | null;
  descripcion: string | null;
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
