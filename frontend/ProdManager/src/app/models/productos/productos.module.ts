import { DetalleFormula } from '../formula/formula.module';
export interface Producto {
  codigo?: number;
  nombre: string;
  categoria: string;
  stockInicial: number;
  descripcion?: string;
  imagen?: string;
  formula: DetalleFormula[];
}