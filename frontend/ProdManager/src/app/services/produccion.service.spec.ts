import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
    HttpTestingController,
    provideHttpClientTesting
} from '@angular/common/http/testing';

import { ProduccionService } from './produccion.service';
import { OrdenProduccion } from '../models/orden-produccion/orden-produccion.model';

const API = 'http://localhost:3000';

// Cuatro órdenes que cubren los cuatro estados, tres productos y cantidades
// y fechas distintas, para poder verificar filtrado y ordenamiento.
const ORDENES = [
    { id: 1, id_orden: 1, fecha_creacion: '2026-09-01 09:00:00', id_estado: 1 },
    { id: 2, id_orden: 2, fecha_creacion: '2026-09-10 09:00:00', id_estado: 3 },
    { id: 3, id_orden: 3, fecha_creacion: '2026-09-05 09:00:00', id_estado: 4 },
    { id: 4, id_orden: 4, fecha_creacion: '2026-09-03 09:00:00', id_estado: 2 }
];
const DETALLES = [
    { id: 1, id_detalle_produccion: 1, id_orden: 1, id_producto: 1, cantidad_planificada: 15, cantidad_producida: 0 },
    { id: 2, id_detalle_produccion: 2, id_orden: 2, id_producto: 2, cantidad_planificada: 5, cantidad_producida: 5 },
    { id: 3, id_detalle_produccion: 3, id_orden: 3, id_producto: 3, cantidad_planificada: 40, cantidad_producida: 0 },
    { id: 4, id_detalle_produccion: 4, id_orden: 4, id_producto: 1, cantidad_planificada: 2, cantidad_producida: 0 }
];
const ESTADOS = [
    { id: 1, nombre: 'Pendiente' },
    { id: 2, nombre: 'En Produccion' },
    { id: 3, nombre: 'Finalizada' },
    { id: 4, nombre: 'Cancelada' }
];
// "Mesa Nórdica" y "Silla Nordica" difieren solo en la tilde: sirven para
// comprobar que la búsqueda no distingue acentos.
const PRODUCTOS = [
    { id: 1, nombre: 'Mesa Nórdica', id_categoria: 1, unidad_medida: 'u', stock_actual: 4, stock_minimo: 1, id_estado: 1 },
    { id: 2, nombre: 'Silla Nordica', id_categoria: 1, unidad_medida: 'u', stock_actual: 9, stock_minimo: 2, id_estado: 1 },
    { id: 3, nombre: 'Banqueta Alta', id_categoria: 1, unidad_medida: 'u', stock_actual: 7, stock_minimo: 2, id_estado: 1 }
];

function ordenDePrueba(
    parciales: Partial<OrdenProduccion> & Pick<OrdenProduccion, 'id'>
): OrdenProduccion {
    return {
        producto: { id: 'PT-001', nombre: 'Mesa Nórdica', unidadMedida: 'u' },
        cantidad: 1,
        cantidadProducida: 0,
        estado: 'pendiente',
        disponibilidadMateriales: 'disponible',
        materialesRequeridos: [],
        fechaCreacion: '2026-01-01T00:00:00',
        historialEstados: [],
        ...parciales
    };
}

describe('ProduccionService', () => {
    let service: ProduccionService;
    let http: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting()]
        });
        service = TestBed.inject(ProduccionService);
        http = TestBed.inject(HttpTestingController);

        service.cargarOrdenes().subscribe();

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
    });

    afterEach(() => http.verify());

    it('se crea correctamente', () => {
        expect(service).toBeTruthy();
    });

    it('carga las órdenes desde la API', () => {
        expect(service.obtenerOrdenes().length).toBe(4);
    });

    describe('filtrar', () => {
        it('devuelve el listado completo cuando no hay criterios', () => {
            expect(service.filtrar({}).length).toBe(4);
        });

        it('ignora una búsqueda que solo tiene espacios', () => {
            expect(service.filtrar({ busqueda: '   ' }).length).toBe(4);
        });

        it('busca por nombre de producto sin distinguir acentos ni mayúsculas', () => {
            const resultado = service.filtrar({ busqueda: 'NORD' });

            expect(resultado.map(orden => orden.id)).toEqual([
                'OP-001',
                'OP-002',
                'OP-004'
            ]);
        });

        it('busca por identificador de la orden', () => {
            expect(service.filtrar({ busqueda: 'op-003' }).map(o => o.id)).toEqual([
                'OP-003'
            ]);
        });

        it('filtra por estado', () => {
            const resultado = service.filtrar({ estado: 'cancelada' });

            expect(resultado.map(orden => orden.id)).toEqual(['OP-003']);
        });

        it('filtra por producto', () => {
            const productoId = service.obtenerOrdenes()[0].producto.id;
            const resultado = service.filtrar({ productoId });

            expect(resultado.length).toBe(2);
            expect(
                resultado.every(orden => orden.producto.id === productoId)
            ).toBeTrue();
        });

        it('combina varios criterios a la vez', () => {
            const resultado = service.filtrar({
                busqueda: 'nord',
                estado: 'finalizada'
            });

            expect(resultado.map(orden => orden.id)).toEqual(['OP-002']);
        });

        it('devuelve un listado vacío cuando ningún registro coincide', () => {
            expect(service.filtrar({ busqueda: 'inexistente' })).toEqual([]);
        });

        it('devuelve vacío cuando los criterios son válidos pero incompatibles', () => {
            const resultado = service.filtrar({
                estado: 'cancelada',
                busqueda: 'mesa'
            });

            expect(resultado).toEqual([]);
        });

        it('no altera el listado original al filtrar', () => {
            service.filtrar({ estado: 'cancelada' });

            expect(service.obtenerOrdenes().length).toBe(4);
        });
    });

    describe('ordenar', () => {
        it('ordena por cantidad ascendente', () => {
            const resultado = service.ordenar(service.obtenerOrdenes(), {
                campo: 'cantidad',
                direccion: 'asc'
            });

            expect(resultado.map(orden => orden.cantidad)).toEqual([2, 5, 15, 40]);
        });

        it('ordena por cantidad descendente', () => {
            const resultado = service.ordenar(service.obtenerOrdenes(), {
                campo: 'cantidad',
                direccion: 'desc'
            });

            expect(resultado.map(orden => orden.cantidad)).toEqual([40, 15, 5, 2]);
        });

        it('ordena por identificador', () => {
            const resultado = service.ordenar(service.obtenerOrdenes(), {
                campo: 'id',
                direccion: 'desc'
            });

            expect(resultado.map(orden => orden.id)).toEqual([
                'OP-004',
                'OP-003',
                'OP-002',
                'OP-001'
            ]);
        });

        it('ordena por nombre de producto', () => {
            const resultado = service.ordenar(service.obtenerOrdenes(), {
                campo: 'producto',
                direccion: 'asc'
            });

            expect(resultado[0].producto.nombre).toBe('Banqueta Alta');
        });

        it('ordena por estado siguiendo el flujo de producción', () => {
            const resultado = service.ordenar(service.obtenerOrdenes(), {
                campo: 'estado',
                direccion: 'asc'
            });

            expect(resultado.map(orden => orden.estado)).toEqual([
                'pendiente',
                'en_produccion',
                'finalizada',
                'cancelada'
            ]);
        });

        it('ordena por fecha de creación', () => {
            const resultado = service.ordenar(service.obtenerOrdenes(), {
                campo: 'fechaCreacion',
                direccion: 'asc'
            });

            expect(resultado.map(orden => orden.id)).toEqual([
                'OP-001',
                'OP-004',
                'OP-003',
                'OP-002'
            ]);
        });

        it('mezcla la fecha de la API con la de una orden recién creada', () => {
            const mezcladas = [
                ordenDePrueba({ id: 'A', fechaCreacion: '2026-09-10T09:00:00' }),
                ordenDePrueba({ id: 'B', fechaCreacion: new Date(2026, 8, 20).toISOString() }),
                ordenDePrueba({ id: 'C', fechaCreacion: '2026-09-01T09:00:00' })
            ];

            const resultado = service.ordenar(mezcladas, {
                campo: 'fechaCreacion',
                direccion: 'asc'
            });

            expect(resultado.map(orden => orden.id)).toEqual(['C', 'A', 'B']);
        });

        it('tolera una fecha vacía sin romper el ordenamiento', () => {
            const conVacia = [
                ordenDePrueba({ id: 'A', fechaCreacion: '2026-09-10T09:00:00' }),
                ordenDePrueba({ id: 'B', fechaCreacion: '' })
            ];

            const resultado = service.ordenar(conVacia, {
                campo: 'fechaCreacion',
                direccion: 'asc'
            });

            expect(resultado.map(orden => orden.id)).toEqual(['B', 'A']);
        });

        it('devuelve una copia sin mutar el arreglo recibido', () => {
            const original = service.obtenerOrdenes();
            const idsOriginales = original.map(orden => orden.id);

            const resultado = service.ordenar(original, {
                campo: 'cantidad',
                direccion: 'desc'
            });

            expect(original.map(orden => orden.id)).toEqual(idsOriginales);
            expect(resultado).not.toBe(original);
        });
    });

    describe('obtenerProductosDeOrdenes', () => {
        it('devuelve productos sin repetir y ordenados por nombre', () => {
            const productos = service.obtenerProductosDeOrdenes();
            const ids = productos.map(producto => producto.id);

            expect(new Set(ids).size).toBe(ids.length);
            expect(productos.map(producto => producto.nombre)).toEqual([
                'Banqueta Alta',
                'Mesa Nórdica',
                'Silla Nordica'
            ]);
        });
    });
});
