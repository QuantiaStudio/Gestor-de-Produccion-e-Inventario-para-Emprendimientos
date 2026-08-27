export interface Producto {
  codigo?: number;
  nombre: string;
  categoria: string;
  stockInicial: number;
  descripcion?: string;
  formula: DetalleFormula[];
}