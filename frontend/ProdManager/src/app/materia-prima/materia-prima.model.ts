export type EstadoMateriaPrima = 'Disponible' | 'Bajo stock' | 'Sin stock';

export interface MateriaPrima {
  id: string;
  nombre: string;
  categoria: string;
  cantidad: number;
  unidadMedida: string;
  stockMinimo: number;
  estado: EstadoMateriaPrima;
  descripcion: string;
  proveedor: string;
  ultimaActualizacion: string;
}
