export interface MateriaPrima {
  id: string;
  nombre: string;
  categoria: string;
  unidad: string; 
  stockTotal: number;
  stockDisponible: number;
  nivelMinimo: number;
  estado: 'optimo' | 'bajo_minimo' | 'sin_stock';
}