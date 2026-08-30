import type { DetalleFormula } from '../formula/formula.module';

export interface Producto {
  codigo?: string;
  nombre: string;
  categoria: string;
  stockInicial: number;
  descripcion?: string;
  imagen?: string;
  formula: DetalleFormula[];
}

export interface MaterialAgregadoProducto {
  materiaPrimaId: number;
  nombre: string;
  cantidadMaterial: number;
  unidad: string;
}

export interface NuevoProductoFormValue {
  codigo: string | null;
  nombre: string | null;
  categoria: string | null;
  stockInicial: number | null;
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
