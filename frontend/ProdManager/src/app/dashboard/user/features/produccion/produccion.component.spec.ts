import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { ProduccionComponent } from './produccion.component';

const API = 'http://localhost:3000';

// Tres ordenes: dos del mismo producto con acento distinto, una cancelada.
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

function responder(http: HttpTestingController): void {
  const contestar = (url: string, cuerpo: object[]) =>
    http.match(url).forEach(peticion => peticion.flush(cuerpo));

  contestar(`${API}/ordenesProduccion`, ORDENES);
  contestar(`${API}/detalleOrdenProduccion`, DETALLES);
  contestar(`${API}/estados`, ESTADOS);
  contestar(`${API}/detalleFormula`, []);
  contestar(`${API}/productos`, PRODUCTOS);
  contestar(`${API}/movimientosInventarioProducto`, []);
  contestar(`${API}/categorias`, [{ id: 1, nombre: 'Mesas' }]);
  contestar(`${API}/materiasPrimas`, []);
  contestar(`${API}/movimientosStockMateriaPrima`, []);
}

function filas(fixture: ComponentFixture<ProduccionComponent>): string[] {
  return Array.from(
    fixture.nativeElement.querySelectorAll('.stock-table tbody tr')
  ).map(fila => (fila as HTMLElement).textContent?.replace(/\s+/g, ' ').trim() ?? '');
}

function encabezado(
  fixture: ComponentFixture<ProduccionComponent>,
  indice: number
): HTMLTableCellElement {
  return fixture.nativeElement.querySelectorAll('.stock-table thead th')[indice];
}

describe('ProduccionComponent', () => {
  let fixture: ComponentFixture<ProduccionComponent>;
  let component: ProduccionComponent;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProduccionComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(ProduccionComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);

    fixture.detectChanges();
    responder(http);
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  it('se crea correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('carga el listado completo desde la API', () => {
    expect(filas(fixture).length).toBe(3);
  });

  it('ordena por fecha descendente al entrar', () => {
    expect(component.ordenes.map(orden => orden.id)).toEqual([
      'OP-002',
      'OP-003',
      'OP-001'
    ]);
  });

  it('la barra de filtros está conectada y ofrece los productos con órdenes', () => {
    const selectProducto: HTMLSelectElement = fixture.nativeElement.querySelector(
      'app-produccion-filtros select[formControlName="productoId"]'
    );

    expect(selectProducto).toBeTruthy();
    expect(selectProducto.options.length).toBe(4);
  });

  it('busca sin distinguir acentos', () => {
    component.aplicarFiltros({ busqueda: 'nord' });
    fixture.detectChanges();

    expect(filas(fixture).length).toBe(2);
  });

  it('filtra por estado', () => {
    component.aplicarFiltros({ estado: 'cancelada' });
    fixture.detectChanges();

    const texto = filas(fixture);
    expect(texto.length).toBe(1);
    expect(texto[0]).toContain('OP-003');
  });

  it('avisa cuando ningún registro cumple el criterio', () => {
    component.aplicarFiltros({ busqueda: 'inexistente' });
    fixture.detectChanges();

    expect(
      fixture.nativeElement
        .querySelector('.stock-table tbody .text-muted')
        .textContent.replace(/\s+/g, ' ')
        .trim()
    ).toBe('No se encontraron órdenes coincidentes con los filtros seleccionados.');
  });

  it('el contador refleja el filtro', () => {
    component.aplicarFiltros({ busqueda: 'nord' });
    fixture.detectChanges();

    expect(
      fixture.nativeElement
        .querySelector('.results-info')
        .textContent.replace(/\s+/g, ' ')
        .trim()
    ).toBe('Mostrando 2 de 3 órdenes con los filtros aplicados');
  });

  it('ordena por cantidad al pulsar el encabezado, y lo invierte al repetir', () => {
    const cantidad = 2;

    encabezado(fixture, cantidad).querySelector('button')!.click();
    fixture.detectChanges();
    expect(component.ordenes.map(orden => orden.cantidad)).toEqual([5, 15, 40]);

    encabezado(fixture, cantidad).querySelector('button')!.click();
    fixture.detectChanges();
    expect(component.ordenes.map(orden => orden.cantidad)).toEqual([40, 15, 5]);
    expect(encabezado(fixture, cantidad).getAttribute('aria-sort')).toBe('descending');
  });

  it('ordena por estado siguiendo el flujo de producción', () => {
    encabezado(fixture, 3).querySelector('button')!.click();
    fixture.detectChanges();

    expect(component.ordenes.map(orden => orden.estado)).toEqual([
      'pendiente',
      'finalizada',
      'cancelada'
    ]);
  });

  it('las tarjetas cuentan el total aunque haya un filtro activo', () => {
    component.aplicarFiltros({ estado: 'cancelada' });
    fixture.detectChanges();

    expect(filas(fixture).length).toBe(1);
    expect(component.conteoPorEstado).toEqual({
      pendiente: 1,
      en_produccion: 0,
      finalizada: 1,
      cancelada: 1
    });

    const valores = Array.from(
      fixture.nativeElement.querySelectorAll('.stat-value')
    ).map(nodo => (nodo as HTMLElement).textContent?.trim());
    expect(valores).toEqual(['1', '0', '1', '1']);
  });

  it('cierra el detalle si la orden seleccionada queda fuera del filtro', () => {
    component.seleccionarOrden(component.ordenes[0]);
    expect(component.Ordenseleccionada).toBeDefined();

    component.aplicarFiltros({ busqueda: 'inexistente' });
    fixture.detectChanges();

    expect(component.Ordenseleccionada).toBeUndefined();
  });

  it('muestra el estado con su badge de color', () => {
    const badge: HTMLElement = fixture.nativeElement.querySelector(
      '.stock-table tbody .badge'
    );

    expect(badge.textContent?.trim()).toBe('Finalizada');
    expect(badge.classList.contains('badge-finalizada')).toBeTrue();
  });

  it('informa el total sin mencionar filtros cuando no hay ninguno', () => {
    expect(
      fixture.nativeElement
        .querySelector('.results-info')
        .textContent.replace(/\s+/g, ' ')
        .trim()
    ).toBe('Mostrando 3 de 3 órdenes');
  });

  it('la columna Acciones no es ordenable', () => {
    const acciones = encabezado(fixture, 5);

    expect(acciones.querySelector('button')).toBeNull();
    expect(acciones.getAttribute('aria-sort')).toBeNull();
  });

  it('muestra la flecha solo en la columna activa', () => {
    encabezado(fixture, 2).querySelector('button')!.click();
    fixture.detectChanges();

    const flechas = fixture.nativeElement.querySelectorAll('.th-sort__icono');
    expect(flechas.length).toBe(1);
    expect(flechas[0].getAttribute('src')).toBe('assets/arrow-up.svg');
  });

  it('avisa que no hay órdenes registradas cuando la API no devuelve ninguna', () => {
    const vacio = TestBed.createComponent(ProduccionComponent);
    vacio.detectChanges();

    http.match(`${API}/ordenesProduccion`).forEach(p => p.flush([]));
    http.match(`${API}/detalleOrdenProduccion`).forEach(p => p.flush([]));
    http.match(`${API}/estados`).forEach(p => p.flush(ESTADOS));
    http.match(`${API}/detalleFormula`).forEach(p => p.flush([]));
    http.match(`${API}/productos`).forEach(p => p.flush([]));
    http.match(`${API}/movimientosInventarioProducto`).forEach(p => p.flush([]));
    http.match(`${API}/categorias`).forEach(p => p.flush([]));
    http.match(`${API}/materiasPrimas`).forEach(p => p.flush([]));
    http.match(`${API}/movimientosStockMateriaPrima`).forEach(p => p.flush([]));
    vacio.detectChanges();

    expect(
      vacio.nativeElement
        .querySelector('.stock-table tbody .text-muted')
        .textContent.replace(/\s+/g, ' ')
        .trim()
    ).toBe('Todavía no hay órdenes de producción registradas.');
  });
});
