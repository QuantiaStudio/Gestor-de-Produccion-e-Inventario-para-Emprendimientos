import { TestBed } from '@angular/core/testing';

import { MateriaPrimaService } from './materia-prima.service';

describe('MateriaPrimaService', () => {

  let service: MateriaPrimaService;

  beforeEach(() => {

    TestBed.configureTestingModule({
      providers: [
        MateriaPrimaService
      ]
    });

    service = TestBed.inject(MateriaPrimaService);
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('un ingreso debería aumentar el stock disponible y total', () => {

    const stockResultante = service.registrarMovimiento('M001', 'ingreso', 50);

    const materiaPrima = service.obtenerPorId('M001');

    expect(stockResultante).toBe(370);
    expect(materiaPrima?.stockDisponible).toBe(370);
    expect(materiaPrima?.stockTotal).toBe(370);
  });

  it('un consumo debería disminuir el stock disponible y total', () => {

    const stockResultante = service.registrarMovimiento('M001', 'consumo', 20);

    const materiaPrima = service.obtenerPorId('M001');

    expect(stockResultante).toBe(300);
    expect(materiaPrima?.stockDisponible).toBe(300);
  });

  it('debería reflejar el cambio de stock inmediatamente en la misma referencia del listado', () => {

    const materiasPrimas = service.obtenerMateriasPrimas();
    const materiaPrima = materiasPrimas.find(mp => mp.id === 'M001');

    service.registrarMovimiento('M001', 'ingreso', 10);

    expect(materiaPrima?.stockDisponible).toBe(330);
  });

  it('debería recalcular el estado a "bajo_minimo" cuando el stock llega al mínimo', () => {

    // Pintura Blanca: stockTotal 15, stockMinimo 20
    service.registrarMovimiento('M002', 'ingreso', 5);

    const materiaPrima = service.obtenerPorId('M002');

    expect(materiaPrima?.stockTotal).toBe(20);
    expect(materiaPrima?.estado).toBe('bajo_minimo');
  });

  it('debería recalcular el estado a "sin_stock" cuando el stock llega a 0', () => {

    // Barniz Transparente: stockTotal 3
    service.registrarMovimiento('M004', 'consumo', 3);

    const materiaPrima = service.obtenerPorId('M004');

    expect(materiaPrima?.stockTotal).toBe(0);
    expect(materiaPrima?.estado).toBe('sin_stock');
  });

  it('debería recalcular el estado a "optimo" cuando el stock supera el mínimo', () => {

    // Pintura Blanca: stockTotal 15, stockMinimo 20, estado inicial bajo_minimo
    service.registrarMovimiento('M002', 'ingreso', 10);

    const materiaPrima = service.obtenerPorId('M002');

    expect(materiaPrima?.estado).toBe('optimo');
  });

  it('debería devolver undefined si la materia prima no existe', () => {

    const stockResultante = service.registrarMovimiento('M999', 'ingreso', 10);

    expect(stockResultante).toBeUndefined();
  });
});
