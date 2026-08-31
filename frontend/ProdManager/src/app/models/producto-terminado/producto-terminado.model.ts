// sin_stock: stockActual === 0 | bajo_minimo: stockActual > 0 && stockActual <= stockMinimo | optimo: el resto
export type EstadoProductoTerminado = 'optimo' | 'bajo_minimo' | 'sin_stock';

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
  ubicacion: string;
  ultimaActualizacion: string;
  lote?: string;
  fechaVencimiento?: string;
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
