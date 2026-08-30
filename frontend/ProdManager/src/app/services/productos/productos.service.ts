import { Injectable } from '@angular/core';

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
  codigo: string | null;
  nombre: string | null;
  categoria: string | null;
  stockInicial: number | null;
  descripcion: string | null;
  formula: {
    materiaPrimaId: number;
    cantidad: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  constructor() { }

  crearProducto(
    formValue: NuevoProductoFormValue,
    materialesAgregados: MaterialAgregadoProducto[]
  ): NuevoProducto {

    const producto = {
      codigo: formValue.codigo,
      nombre: formValue.nombre,
      categoria: formValue.categoria,
      stockInicial: formValue.stockInicial,
      descripcion: formValue.descripcion,

      formula: materialesAgregados.map(material => ({
        materiaPrimaId: material.materiaPrimaId,
        cantidad: material.cantidadMaterial
      }))
    };

    console.log(producto);

    return producto;

  }
}
