import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { ProduccionComponent } from './produccion.component';

const API = 'http://localhost:3000';

// Tres órdenes: dos del mismo producto escrito con y sin tilde, para
// comprobar que la búsqueda no distingue acentos, y una cancelada.
const ORDENES = [
  { id: 1, id_orden: 1, fecha_creacion: '2026-09-01 09:00:00', id_estado: 1 },
  { id: 2, id_orden: 2, fecha_creacion: '2026-09-10 09:00:00', id_estado: 3 },
  { id: 3, id_orden: 3, fecha_creacion: '2026-09-05 09:00:00', id_estado: 4 }
];
const DETALLES = [
  { id: 1, id_detalle_produccion: 1, id_orden: 1, id_producto: 1, cantidad_planificada: 15, cantidad_producida: 0 },
  { id: 2, id_detalle_produccion: 2, id_orden: 2, id_producto: 2, cantidad_planificada: 5, cantidad_producida: 5 },
  { id: 3, id_detalle_produccion: 3, id_orden: 3, id_producto: 3, cantidad_planificada: 40, cantidad_producida: 0 }
];
const ESTADOS = [
  { id: 1, nombre: 'Pendiente' },
  { id: 2, nombre: 'En Produccion' },
  { id: 3, nombre: 'Finalizada' },
  { id: 4, nombre: 'Cancelada' }
];
const PRODUCTOS = [
  { id: 1, nombre: 'Mesa Nórdica', id_categoria: 1, unidad_medida: 'u', stock_actual: 4, stock_minimo: 1, id_estado: 1 },
  { id: 2, nombre: 'Silla Nordica', id_categoria: 1, unidad_medida: 'u', stock_actual: 9, stock_minimo: 2, id_estado: 1 },
  { id: 3, nombre: 'Banqueta Alta', id_categoria: 1, unidad_medida: 'u', stock_actual: 7, stock_minimo: 2, id_estado: 1 }
];

const COLECCIONES: Record<string, object[]> = {
  ordenesProduccion: ORDENES,
  detalleOrdenProduccion: DETALLES,
  estados: ESTADOS,
  detalleFormula: [],
  productos: PRODUCTOS,
  movimientosInventarioProducto: [],
  categorias: [{ id: 1, nombre: 'Mesas' }],
  materiasPrimas: [],
  movimientosStockMateriaPrima: []
};

function texto(elemento: Element | null): string {
  return elemento?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
}

describe('ProduccionComponent', () => {
  let fixture: ComponentFixture<ProduccionComponent>;
  let component: ProduccionComponent;
  let http: HttpTestingController;

  function responder(colecciones: Record<string, object[]> = COLECCIONES): void {
    Object.entries(colecciones).forEach(([nombre, filas]) =>
      http.match(`${API}/${nombre}`).forEach(peticion => peticion.flush(filas))
    );
  }

  function idsVisibles(): string[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll('.orders-table tbody tr td:first-child')
    ).map(celda => texto(celda as Element));
  }

  function encabezado(indice: number): HTMLTableCellElement {
    return fixture.nativeElement.querySelectorAll('.orders-table thead th')[indice];
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProduccionComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(ProduccionComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
    responder();
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('muestra el listado completo al entrar', () => {
    expect(idsVisibles().length).toBe(3);
    expect(texto(fixture.nativeElement.querySelector('.results-info')))
      .toBe('Mostrando 3 de 3 órdenes');
  });

  it('ordena por fecha descendente al entrar', () => {
    expect(idsVisibles()).toEqual(['#OP-002', '#OP-003', '#OP-001']);
  });

  it('busca sin distinguir acentos', () => {
    component.filtroTexto.setValue('nord');
    fixture.detectChanges();

    expect(idsVisibles()).toEqual(['#OP-002', '#OP-001']);
  });

  it('filtra por estado', () => {
    component.filtroEstado.setValue('cancelada');
    fixture.detectChanges();

    expect(idsVisibles()).toEqual(['#OP-003']);
  });

  it('filtra al pulsar una tarjeta de resumen', () => {
    component.filtrarPorEstado('finalizada');
    fixture.detectChanges();

    expect(idsVisibles()).toEqual(['#OP-002']);
  });

  it('las tarjetas cuentan el total aunque haya un filtro activo', () => {
    component.filtroEstado.setValue('cancelada');
    fixture.detectChanges();

    expect(idsVisibles().length).toBe(1);
    expect(component.totalPendientes).toBe(1);
    expect(component.totalFinalizadas).toBe(1);
    expect(component.totalCanceladas).toBe(1);
  });

  it('limpiar filtros devuelve el listado completo', () => {
    component.filtroTexto.setValue('nord');
    component.filtroEstado.setValue('finalizada');
    fixture.detectChanges();
    expect(idsVisibles().length).toBe(1);

    component.limpiarFiltros();
    fixture.detectChanges();

    expect(idsVisibles().length).toBe(3);
    expect(texto(fixture.nativeElement.querySelector('.results-info')))
      .toBe('Mostrando 3 de 3 órdenes');
  });

  it('ordena por cantidad al pulsar el encabezado, y lo invierte al repetir', () => {
    encabezado(2).querySelector('button')!.click();
    fixture.detectChanges();
    expect(component.ordenesFiltradas.map(o => o.cantidad)).toEqual([5, 15, 40]);

    encabezado(2).querySelector('button')!.click();
    fixture.detectChanges();
    expect(component.ordenesFiltradas.map(o => o.cantidad)).toEqual([40, 15, 5]);
    expect(encabezado(2).getAttribute('aria-sort')).toBe('descending');
  });

  it('ordena por estado siguiendo el flujo de producción', () => {
    encabezado(3).querySelector('button')!.click();
    fixture.detectChanges();

    expect(component.ordenesFiltradas.map(o => o.estado)).toEqual([
      'pendiente',
      'finalizada',
      'cancelada'
    ]);
  });

  it('conserva el orden elegido al aplicar un filtro', () => {
    encabezado(2).querySelector('button')!.click();
    encabezado(2).querySelector('button')!.click();
    component.filtroTexto.setValue('nord');
    fixture.detectChanges();

    expect(idsVisibles()).toEqual(['#OP-001', '#OP-002']);
  });

  it('muestra la flecha solo en la columna activa', () => {
    encabezado(2).querySelector('button')!.click();
    fixture.detectChanges();

    const flechas = fixture.nativeElement.querySelectorAll('.th-sort__icono');
    expect(flechas.length).toBe(1);
    expect(flechas[0].getAttribute('src')).toBe('assets/arrow-up.svg');
  });

  it('la columna de acciones no es ordenable', () => {
    expect(encabezado(5).querySelector('button')).toBeNull();
    expect(encabezado(5).getAttribute('aria-sort')).toBeNull();
  });

  it('avisa cuando ningún registro cumple el criterio', () => {
    component.filtroTexto.setValue('inexistente');
    fixture.detectChanges();

    expect(texto(fixture.nativeElement.querySelector('.sin-resultados')))
      .toBe('No se encontraron órdenes coincidentes con los filtros seleccionados.');
    expect(texto(fixture.nativeElement.querySelector('.results-info')))
      .toBe('Mostrando 0 de 3 órdenes con los filtros aplicados');
  });

  it('distingue no haber órdenes de no haber coincidencias', () => {
    const vacio = TestBed.createComponent(ProduccionComponent);
    vacio.detectChanges();
    Object.entries({ ...COLECCIONES, ordenesProduccion: [], productos: [] })
      .forEach(([nombre, filas]) =>
        http.match(`${API}/${nombre}`).forEach(peticion => peticion.flush(filas))
      );
    vacio.detectChanges();

    expect(texto(vacio.nativeElement.querySelector('.sin-resultados')))
      .toBe('Todavía no hay órdenes de producción registradas.');
  });

  it('muestra el estado con su badge de color', () => {
    const badge: HTMLElement = fixture.nativeElement.querySelector(
      '.orders-table tbody .badge'
    );

    expect(texto(badge)).toBe('Finalizada');
    expect(badge.classList.contains('badge-finalizada')).toBeTrue();
  });

  it('cierra el detalle si la orden seleccionada queda fuera del filtro', () => {
    component.verDetalle(component.ordenesFiltradas[0]);
    expect(component.Ordenseleccionada).toBeDefined();

    component.filtroTexto.setValue('inexistente');
    fixture.detectChanges();

    expect(component.Ordenseleccionada).toBeUndefined();
  });
});
