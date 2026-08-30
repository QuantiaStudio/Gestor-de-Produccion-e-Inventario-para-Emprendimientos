import { Injectable } from '@angular/core';
import type { MaterialAgregadoProducto, NuevoProducto, NuevoProductoFormValue } from '../../models/productos/productos.module';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  constructor() { }

  crearProducto(
    formValue: NuevoProductoFormValue,
    materialesAgregados: MaterialAgregadoProducto[]
  ): NuevoProducto {

    const producto: NuevoProducto = {
      codigo: formValue.codigo ?? '',
      nombre: formValue.nombre ?? '',
      categoria: formValue.categoria ?? '',
      stockInicial: formValue.stockInicial ?? 0,
      descripcion: formValue.descripcion ?? '',

      formula: materialesAgregados.map(material => ({
        materiaPrimaId: material.materiaPrimaId,
        nombreMateriaPrima: material.nombre,
        cantidad: material.cantidadMaterial
      }))
    };

    console.log(producto);

    return producto;

  }
}
