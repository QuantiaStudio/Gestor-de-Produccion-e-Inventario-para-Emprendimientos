export type EstadoMateriaPrima = 'optimo' | 'bajo_minimo' | 'sin_stock';

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

export interface MovimientoStock {
  id: string;
  materiaPrimaId: string;
  fecha: string;
  tipo: TipoMovimientoStock;
  cantidad: number;
  stockResultante: number;
}
