import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProduccionFiltrosComponent } from './produccion-filtros.component';
import { FiltroOrdenProduccion } from '../../../../../models/orden-produccion/orden-produccion.model';

describe('ProduccionFiltrosComponent', () => {
  let component: ProduccionFiltrosComponent;
  let fixture: ComponentFixture<ProduccionFiltrosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProduccionFiltrosComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ProduccionFiltrosComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('productos', [
      { id: 'PT-001', nombre: 'Mesa Nórdica', unidadMedida: 'u' },
      { id: 'PT-002', nombre: 'Biblioteca Moderna', unidadMedida: 'u' }
    ]);
    fixture.detectChanges();
  });

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('muestra una opción por producto recibido más la opción Todos', () => {
    const selectProducto: HTMLSelectElement =
      fixture.nativeElement.querySelector('select[formControlName="productoId"]');

    expect(selectProducto.options.length).toBe(3);
    expect(selectProducto.options[0].textContent?.trim()).toBe('Todos');
  });

  it('ofrece los cuatro estados de una orden', () => {
    const selectEstado: HTMLSelectElement =
      fixture.nativeElement.querySelector('select[formControlName="estado"]');

    expect(selectEstado.options.length).toBe(5);
  });

  it('emite los filtros cuando cambia la búsqueda', () => {
    let emitido: FiltroOrdenProduccion | undefined;
    component.filtrosCambiaron.subscribe(filtros => (emitido = filtros));

    component.formulario.controls.busqueda.setValue('mesa');

    expect(emitido).toEqual({
      busqueda: 'mesa',
      estado: undefined,
      productoId: undefined
    });
  });

  it('traduce la opción vacía de los selects a un criterio sin definir', () => {
    let emitido: FiltroOrdenProduccion | undefined;
    component.filtrosCambiaron.subscribe(filtros => (emitido = filtros));

    component.formulario.controls.estado.setValue('cancelada');
    expect(emitido?.estado).toBe('cancelada');

    component.formulario.controls.estado.setValue('');
    expect(emitido?.estado).toBeUndefined();
  });

  it('emite criterios vacíos al limpiar los filtros', () => {
    component.formulario.setValue({
      busqueda: 'mesa',
      estado: 'pendiente',
      productoId: 'PT-001'
    });

    let emitido: FiltroOrdenProduccion | undefined;
    component.filtrosCambiaron.subscribe(filtros => (emitido = filtros));

    component.limpiar();

    expect(emitido).toEqual({
      busqueda: '',
      estado: undefined,
      productoId: undefined
    });
  });

  it('deja de emitir una vez destruido', () => {
    let emisiones = 0;
    component.filtrosCambiaron.subscribe(() => (emisiones += 1));

    fixture.destroy();
    component.formulario.controls.busqueda.setValue('mesa');

    expect(emisiones).toBe(0);
  });
});
