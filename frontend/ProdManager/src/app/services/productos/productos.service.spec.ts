import { TestBed } from '@angular/core/testing';

import { ProductosService } from './productos.service';

describe('ProductosService', () => {
  let service: ProductosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a product from form values and selected materials', () => {
    const producto = service.crearProducto(
      {
        codigo: 'MESA-001',
        nombre: 'Mesa ratona',
        categoria: 'Muebles',
        stockInicial: 5,
        descripcion: 'Mesa de MDF'
      },
      [
        {
          materiaPrimaId: 1,
          nombre: 'Tablero MDF 18 mm',
          cantidadMaterial: 2,
          unidad: 'unidad'
        }
      ]
    );

    expect(producto).toEqual({
      codigo: 'MESA-001',
      nombre: 'Mesa ratona',
      categoria: 'Muebles',
      stockInicial: 5,
      descripcion: 'Mesa de MDF',
      formula: [
        {
          materiaPrimaId: 1,
          nombreMateriaPrima: 'Tablero MDF 18 mm',
          cantidad: 2
        }
      ]
    });
  });
});
