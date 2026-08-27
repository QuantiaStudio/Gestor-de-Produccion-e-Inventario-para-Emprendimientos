export type EstadoMateriaPrima = 'Activo' | 'Inactivo';

export interface MateriaPrima {
  id: number;
  nombre: string;
  categoria: string;
  unidadMedida: string;
  stockTotal: number;
  stockReservado: number;
  stockDisponible: number;
  stockMinimo: number;
  estado: EstadoMateriaPrima;
}
