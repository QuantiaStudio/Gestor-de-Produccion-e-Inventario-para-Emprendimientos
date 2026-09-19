import { TestBed } from '@angular/core/testing';

import { ProduccionService } from './produccion.service';
import {
    OrdenProduccion
} from '../models/orden-produccion/orden-produccion.model';

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
        fechaCreacion: '01/01/2026',
        historialEstados: [],
        ...parciales
    };
}

describe('ProduccionService', () => {
    let service: ProduccionService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ProduccionService);
    });

    it('se crea correctamente', () => {
        expect(service).toBeTruthy();
    });

    describe('filtrar', () => {
        it('devuelve el listado completo cuando no hay criterios', () => {
            const resultado = service.filtrar({});

            expect(resultado.length).toBe(service.obtenerOrdenes().length);
        });

        it('ignora una búsqueda que solo tiene espacios', () => {
            const resultado = service.filtrar({ busqueda: '   ' });

            expect(resultado.length).toBe(service.obtenerOrdenes().length);
        });

        it('busca por nombre de producto sin distinguir acentos ni mayúsculas', () => {
            const resultado = service.filtrar({ busqueda: 'NORD' });

            expect(resultado.map(orden => orden.id)).toEqual(['OP-001', 'OP-003']);
        });

        it('busca por identificador de la orden', () => {
            const resultado = service.filtrar({ busqueda: 'op-004' });

            expect(resultado.map(orden => orden.id)).toEqual(['OP-004']);
        });

        it('filtra por estado', () => {
            const resultado = service.filtrar({ estado: 'pendiente' });

            expect(resultado.length).toBeGreaterThan(0);
            expect(resultado.every(orden => orden.estado === 'pendiente')).toBeTrue();
        });

        it('filtra por producto', () => {
            const resultado = service.filtrar({ productoId: 'PT-002' });

            expect(resultado.map(orden => orden.id)).toEqual(['OP-002']);
        });

        it('combina varios criterios a la vez', () => {
            const resultado = service.filtrar({
                busqueda: 'nord',
                estado: 'pendiente'
            });

            expect(resultado.map(orden => orden.id)).toEqual(['OP-003']);
        });

        it('devuelve un listado vacío cuando ningún registro coincide', () => {
            const resultado = service.filtrar({ busqueda: 'inexistente' });

            expect(resultado).toEqual([]);
        });

        it('devuelve vacío cuando los criterios son válidos pero incompatibles', () => {
            const resultado = service.filtrar({
                productoId: 'PT-002',
                estado: 'cancelada'
            });

            expect(resultado).toEqual([]);
        });

        it('no altera el listado original al filtrar', () => {
            const cantidadInicial = service.obtenerOrdenes().length;

            service.filtrar({ estado: 'cancelada' });

            expect(service.obtenerOrdenes().length).toBe(cantidadInicial);
        });
    });

    describe('ordenar', () => {
        it('ordena por cantidad ascendente', () => {
            const resultado = service.ordenar(service.obtenerOrdenes(), {
                campo: 'cantidad',
                direccion: 'asc'
            });

            expect(resultado.map(orden => orden.cantidad)).toEqual([2, 5, 10, 15]);
        });

        it('ordena por cantidad descendente', () => {
            const resultado = service.ordenar(service.obtenerOrdenes(), {
                campo: 'cantidad',
                direccion: 'desc'
            });

            expect(resultado.map(orden => orden.cantidad)).toEqual([15, 10, 5, 2]);
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

            expect(resultado[0].producto.nombre).toBe('Biblioteca Moderna');
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

        it('ordena por fecha en formato dd/MM/yyyy', () => {
            const resultado = service.ordenar(service.obtenerOrdenes(), {
                campo: 'fechaCreacion',
                direccion: 'asc'
            });

            expect(resultado.map(orden => orden.fechaCreacion)).toEqual([
                '03/06/2026',
                '04/06/2026',
                '08/06/2026',
                '10/09/2026'
            ]);
        });

        it('ordena por fecha mezclando dd/MM/yyyy con formato ISO', () => {
            const mezcladas = [
                ordenDePrueba({ id: 'A', fechaCreacion: '10/09/2026' }),
                ordenDePrueba({
                    id: 'B',
                    fechaCreacion: new Date(2026, 5, 5).toISOString()
                }),
                ordenDePrueba({ id: 'C', fechaCreacion: '03/06/2026' })
            ];

            const resultado = service.ordenar(mezcladas, {
                campo: 'fechaCreacion',
                direccion: 'asc'
            });

            expect(resultado.map(orden => orden.id)).toEqual(['C', 'B', 'A']);
        });

        it('mantiene el orden por fecha al incorporar una orden recién creada', () => {
            service.crearOrden({ productoId: 'PT-001', cantidad: 3 });

            const resultado = service.ordenar(service.obtenerOrdenes(), {
                campo: 'fechaCreacion',
                direccion: 'asc'
            });

            const fechas = resultado.map(orden =>
                orden.fechaCreacion.includes('/')
                    ? new Date(
                        Number(orden.fechaCreacion.slice(6, 10)),
                        Number(orden.fechaCreacion.slice(3, 5)) - 1,
                        Number(orden.fechaCreacion.slice(0, 2))
                    ).getTime()
                    : new Date(orden.fechaCreacion).getTime()
            );

            const estaOrdenado = fechas.every(
                (fecha, indice) => indice === 0 || fechas[indice - 1] <= fecha
            );

            expect(estaOrdenado).toBeTrue();
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
                'Biblioteca Moderna',
                'Escritorio Minimalsita',
                'Mesa Nórdica',
                'Silla Nordica'
            ]);
        });
    });
});
