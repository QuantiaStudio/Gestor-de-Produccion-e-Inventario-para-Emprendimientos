import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MateriaPrimaMovimientoFormComponent } from './materia-prima-movimiento-form.component';
import { MateriaPrima } from '../../models/materia-prima/materia-prima.model';
import { MateriaPrimaService } from '../../services/materia-prima.service';
import { MovimientoStockService } from '../../services/movimiento-stock.service';

describe('MateriaPrimaMovimientoFormComponent', () => {

  let component: MateriaPrimaMovimientoFormComponent;
  let fixture: ComponentFixture<MateriaPrimaMovimientoFormComponent>;

  let materiasPrimas: MateriaPrima[];
  let materiaPrimaService: jasmine.SpyObj<MateriaPrimaService>;
  let movimientoStockService: jasmine.SpyObj<MovimientoStockService>;

  beforeEach(async () => {

    materiasPrimas = [
      {
        id: 'M001', nombre: 'Madera de Roble', categoria: 'Madera',
        unidadMedida: 'kg', stockTotal: 320, stockDisponible: 320, stockMinimo: 50, estado: 'optimo',
        descripcion: '', proveedor: '', ultimaActualizacion: ''
      },
      {
        id: 'M004', nombre: 'Barniz Transparente', categoria: 'Acabados',
        unidadMedida: 'L', stockTotal: 3, stockDisponible: 3, stockMinimo: 10, estado: 'sin_stock',
        descripcion: '', proveedor: '', ultimaActualizacion: ''
      },
    ];

    materiaPrimaService = jasmine.createSpyObj('MateriaPrimaService', ['registrarMovimiento']);
    movimientoStockService = jasmine.createSpyObj('MovimientoStockService', ['registrarMovimiento']);

    await TestBed.configureTestingModule({
      imports: [MateriaPrimaMovimientoFormComponent],
      providers: [
        { provide: MateriaPrimaService, useValue: materiaPrimaService },
        { provide: MovimientoStockService, useValue: movimientoStockService },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MateriaPrimaMovimientoFormComponent);
    component = fixture.componentInstance;
    component.materiasPrimas = materiasPrimas;
    fixture.detectChanges();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('el formulario debería comenzar inválido', () => {
    expect(component.formMovimiento.invalid).toBeTrue();
  });

  it('debería mostrar el stock disponible de la materia prima seleccionada', () => {

    component.formMovimiento.patchValue({ materiaPrimaId: 'M001' });

    expect(component.materiaSeleccionada?.stockDisponible).toBe(320);
  });

  it('debería rechazar un consumo mayor al stock disponible', () => {

    component.formMovimiento.setValue({ materiaPrimaId: 'M004', tipo: 'consumo', cantidad: 10 });

    expect(component.formMovimiento.hasError('stockInsuficiente')).toBeTrue();
  });

  it('debería aceptar un consumo dentro del stock disponible', () => {

    component.formMovimiento.setValue({ materiaPrimaId: 'M004', tipo: 'consumo', cantidad: 2 });

    expect(component.formMovimiento.valid).toBeTrue();
  });

  it('no debería registrar el movimiento si el formulario es inválido', () => {

    component.registrar();

    expect(materiaPrimaService.registrarMovimiento).not.toHaveBeenCalled();
  });

  it('debería registrar el movimiento y cerrar el formulario cuando es válido', () => {

    materiaPrimaService.registrarMovimiento.and.returnValue(370);
    spyOn(component.cerrar, 'emit');

    component.formMovimiento.setValue({ materiaPrimaId: 'M001', tipo: 'ingreso', cantidad: 50 });
    component.registrar();

    expect(materiaPrimaService.registrarMovimiento).toHaveBeenCalledWith('M001', 'ingreso', 50);
    expect(movimientoStockService.registrarMovimiento).toHaveBeenCalledWith('M001', 'ingreso', 50, 370);
    expect(component.cerrar.emit).toHaveBeenCalled();
  });
});
