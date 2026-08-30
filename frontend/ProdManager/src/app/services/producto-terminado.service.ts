import { Injectable } from '@angular/core';
import { FiltroProductoTerminado, ProductoTerminado, ResumenAlertas } from '../models/producto-terminado/producto-terminado.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoTerminadoService {
  private productosTerminados: ProductoTerminado[] = [
    {
      id: 'PT-001', nombre: 'Mesa Nórdica', categoria: 'Mesas',
      descripcion: 'Mesa de comedor de roble macizo con patas cónicas, acabado natural.',
      imagen: 'assets/mesa_nordica.jpg', unidadMedida: 'unidad',
      stockActual: 28, stockMinimo: 8, stockMaximo: 60, estado: 'optimo',
      ubicacion: 'Depósito Central - Estante A1', ultimaActualizacion: '18/02/2026',
      movimientos: [
        { id: 'MOV-PT001-1', fecha: '12/11/2025', tipo: 'ingreso', cantidad: 30, origen: 'Orden de producción OP-101', stockResultante: 30 },
        { id: 'MOV-PT001-2', fecha: '05/12/2025', tipo: 'egreso', cantidad: 8, origen: 'Venta #287', stockResultante: 22 },
        { id: 'MOV-PT001-3', fecha: '20/01/2026', tipo: 'egreso', cantidad: 6, origen: 'Venta #301', stockResultante: 16 },
        { id: 'MOV-PT001-4', fecha: '18/02/2026', tipo: 'ingreso', cantidad: 12, origen: 'Orden de producción OP-118', stockResultante: 28 },
      ]
    },
    {
      id: 'PT-002', nombre: 'Biblioteca Moderna', categoria: 'Bibliotecas',
      descripcion: 'Biblioteca de cinco estantes en melamina blanca con laterales de pino.',
      imagen: 'assets/biblioteca_moderna.webp', unidadMedida: 'unidad',
      stockActual: 4, stockMinimo: 6, stockMaximo: 40, estado: 'bajo_minimo',
      ubicacion: 'Depósito Central - Estante B2', ultimaActualizacion: '02/03/2026',
      movimientos: [
        { id: 'MOV-PT002-1', fecha: '03/10/2025', tipo: 'ingreso', cantidad: 20, origen: 'Orden de producción OP-092', stockResultante: 20 },
        { id: 'MOV-PT002-2', fecha: '14/11/2025', tipo: 'egreso', cantidad: 7, origen: 'Venta #265', stockResultante: 13 },
        { id: 'MOV-PT002-3', fecha: '09/01/2026', tipo: 'egreso', cantidad: 5, origen: 'Venta #294', stockResultante: 8 },
        { id: 'MOV-PT002-4', fecha: '02/03/2026', tipo: 'egreso', cantidad: 4, origen: 'Venta #318', stockResultante: 4 },
      ]
    },
    {
      id: 'PT-003', nombre: 'Escritorio Gamer', categoria: 'Escritorios',
      descripcion: 'Escritorio de 1.40 m con pasacables metálico y superficie laminada.',
      imagen: 'assets/escritorio_gamer.jpg', unidadMedida: 'unidad',
      stockActual: 29, stockMinimo: 10, stockMaximo: 70, estado: 'optimo',
      ubicacion: 'Depósito Central - Estante A3', ultimaActualizacion: '10/03/2026',
      movimientos: [
        { id: 'MOV-PT003-1', fecha: '21/09/2025', tipo: 'ingreso', cantidad: 25, origen: 'Orden de producción OP-088', stockResultante: 25 },
        { id: 'MOV-PT003-2', fecha: '30/10/2025', tipo: 'ingreso', cantidad: 20, origen: 'Orden de producción OP-095', stockResultante: 45 },
        { id: 'MOV-PT003-3', fecha: '12/12/2025', tipo: 'egreso', cantidad: 9, origen: 'Venta #279', stockResultante: 36 },
        { id: 'MOV-PT003-4', fecha: '25/01/2026', tipo: 'egreso', cantidad: 5, origen: 'Venta #305', stockResultante: 31 },
        { id: 'MOV-PT003-5', fecha: '10/03/2026', tipo: 'ajuste', cantidad: 2, origen: 'Ajuste manual por rotura en depósito', stockResultante: 29 },
      ]
    },
    {
      id: 'PT-004', nombre: 'Mesa Ratona', categoria: 'Mesas',
      descripcion: 'Mesa ratona rectangular de pino con estante inferior.',
      imagen: 'assets/mesa_ratona.webp', unidadMedida: 'unidad',
      stockActual: 0, stockMinimo: 5, stockMaximo: 45, estado: 'sin_stock',
      ubicacion: 'Depósito Central - Estante A2', ultimaActualizacion: '27/02/2026',
      movimientos: [
        { id: 'MOV-PT004-1', fecha: '08/10/2025', tipo: 'ingreso', cantidad: 18, origen: 'Orden de producción OP-090', stockResultante: 18 },
        { id: 'MOV-PT004-2', fecha: '19/11/2025', tipo: 'egreso', cantidad: 6, origen: 'Venta #270', stockResultante: 12 },
        { id: 'MOV-PT004-3', fecha: '15/01/2026', tipo: 'egreso', cantidad: 7, origen: 'Venta #298', stockResultante: 5 },
        { id: 'MOV-PT004-4', fecha: '27/02/2026', tipo: 'egreso', cantidad: 5, origen: 'Venta #315', stockResultante: 0 },
      ]
    },
    {
      id: 'PT-005', nombre: 'Cómoda 6 cajones', categoria: 'Cómodas',
      descripcion: 'Cómoda de seis cajones con guías metálicas y tirador de hierro.',
      imagen: 'assets/comoda_6_cajones.webp', unidadMedida: 'unidad',
      stockActual: 15, stockMinimo: 4, stockMaximo: 30, estado: 'optimo',
      ubicacion: 'Depósito Norte - Sector C', ultimaActualizacion: '06/03/2026',
      lote: 'L-2026-014', fechaVencimiento: '14/02/2028',
      movimientos: [
        { id: 'MOV-PT005-1', fecha: '05/11/2025', tipo: 'ingreso', cantidad: 14, origen: 'Orden de producción OP-099', stockResultante: 14 },
        { id: 'MOV-PT005-2', fecha: '22/12/2025', tipo: 'egreso', cantidad: 3, origen: 'Venta #288', stockResultante: 11 },
        { id: 'MOV-PT005-3', fecha: '14/02/2026', tipo: 'ingreso', cantidad: 6, origen: 'Orden de producción OP-115', stockResultante: 17 },
        { id: 'MOV-PT005-4', fecha: '06/03/2026', tipo: 'egreso', cantidad: 2, origen: 'Venta #321', stockResultante: 15 },
      ]
    },
    {
      id: 'PT-006', nombre: 'Rack TV 1.80', categoria: 'Racks',
      descripcion: 'Rack de televisor de 1.80 m con dos puertas rebatibles.',
      imagen: 'assets/rack_tv.jpg', unidadMedida: 'unidad',
      stockActual: 23, stockMinimo: 6, stockMaximo: 50, estado: 'optimo',
      ubicacion: 'Depósito Central - Estante D1', ultimaActualizacion: '04/03/2026',
      movimientos: [
        { id: 'MOV-PT006-1', fecha: '17/10/2025', tipo: 'ingreso', cantidad: 22, origen: 'Orden de producción OP-093', stockResultante: 22 },
        { id: 'MOV-PT006-2', fecha: '28/11/2025', tipo: 'egreso', cantidad: 5, origen: 'Venta #274', stockResultante: 17 },
        { id: 'MOV-PT006-3', fecha: '23/01/2026', tipo: 'egreso', cantidad: 4, origen: 'Venta #303', stockResultante: 13 },
        { id: 'MOV-PT006-4', fecha: '04/03/2026', tipo: 'ingreso', cantidad: 10, origen: 'Orden de producción OP-120', stockResultante: 23 },
      ]
    },
    {
      id: 'PT-007', nombre: 'Banqueta Alta', categoria: 'Banquetas',
      descripcion: 'Banqueta alta de desayunador con respaldo bajo, en caja de cuatro unidades.',
      imagen: 'assets/banqueta_alta.jpg', unidadMedida: 'caja',
      stockActual: 7, stockMinimo: 10, stockMaximo: 60, estado: 'bajo_minimo',
      ubicacion: 'Depósito Norte - Sector A', ultimaActualizacion: '19/02/2026',
      movimientos: [
        { id: 'MOV-PT007-1', fecha: '02/10/2025', tipo: 'ingreso', cantidad: 32, origen: 'Orden de producción OP-091', stockResultante: 32 },
        { id: 'MOV-PT007-2', fecha: '11/11/2025', tipo: 'egreso', cantidad: 12, origen: 'Venta #268', stockResultante: 20 },
        { id: 'MOV-PT007-3', fecha: '08/01/2026', tipo: 'egreso', cantidad: 9, origen: 'Venta #292', stockResultante: 11 },
        { id: 'MOV-PT007-4', fecha: '19/02/2026', tipo: 'egreso', cantidad: 4, origen: 'Venta #311', stockResultante: 7 },
      ]
    },
    {
      id: 'PT-008', nombre: 'Silla Nórdica', categoria: 'Sillas',
      descripcion: 'Silla de comedor con asiento tapizado y patas de haya barnizadas.',
      imagen: 'assets/banqueta_alta.jpg', unidadMedida: 'unidad',
      stockActual: 40, stockMinimo: 12, stockMaximo: 80, estado: 'optimo',
      ubicacion: 'Depósito Norte - Sector A', ultimaActualizacion: '11/03/2026',
      lote: 'L-2026-008', fechaVencimiento: '29/01/2028',
      movimientos: [
        { id: 'MOV-PT008-1', fecha: '25/09/2025', tipo: 'ingreso', cantidad: 40, origen: 'Orden de producción OP-089', stockResultante: 40 },
        { id: 'MOV-PT008-2', fecha: '06/11/2025', tipo: 'egreso', cantidad: 10, origen: 'Venta #263', stockResultante: 30 },
        { id: 'MOV-PT008-3', fecha: '18/12/2025', tipo: 'egreso', cantidad: 8, origen: 'Venta #281', stockResultante: 22 },
        { id: 'MOV-PT008-4', fecha: '29/01/2026', tipo: 'ingreso', cantidad: 24, origen: 'Orden de producción OP-110', stockResultante: 46 },
        { id: 'MOV-PT008-5', fecha: '11/03/2026', tipo: 'egreso', cantidad: 6, origen: 'Venta #324', stockResultante: 40 },
      ]
    },
    {
      id: 'PT-009', nombre: 'Mesa de Comedor Extensible', categoria: 'Mesas',
      descripcion: 'Mesa extensible de 1.60 a 2.10 m con tablero de MDF enchapado.',
      imagen: 'assets/mesa_nordica.jpg', unidadMedida: 'unidad',
      stockActual: 9, stockMinimo: 5, stockMaximo: 35, estado: 'optimo',
      ubicacion: 'Depósito Central - Estante A4', ultimaActualizacion: '21/02/2026',
      movimientos: [
        { id: 'MOV-PT009-1', fecha: '30/10/2025', tipo: 'ingreso', cantidad: 16, origen: 'Orden de producción OP-096', stockResultante: 16 },
        { id: 'MOV-PT009-2', fecha: '13/12/2025', tipo: 'egreso', cantidad: 4, origen: 'Venta #283', stockResultante: 12 },
        { id: 'MOV-PT009-3', fecha: '21/02/2026', tipo: 'egreso', cantidad: 3, origen: 'Venta #313', stockResultante: 9 },
      ]
    },
    {
      id: 'PT-010', nombre: 'Escritorio Minimalista', categoria: 'Escritorios',
      descripcion: 'Escritorio de 1.10 m sin cajones, estructura de hierro pintado.',
      imagen: 'assets/escritorio_gamer.jpg', unidadMedida: 'unidad',
      stockActual: 15, stockMinimo: 8, stockMaximo: 55, estado: 'optimo',
      ubicacion: 'Depósito Central - Estante A3', ultimaActualizacion: '24/02/2026',
      movimientos: [
        { id: 'MOV-PT010-1', fecha: '09/10/2025', tipo: 'ingreso', cantidad: 26, origen: 'Orden de producción OP-094', stockResultante: 26 },
        { id: 'MOV-PT010-2', fecha: '20/11/2025', tipo: 'egreso', cantidad: 7, origen: 'Venta #272', stockResultante: 19 },
        { id: 'MOV-PT010-3', fecha: '16/01/2026', tipo: 'egreso', cantidad: 5, origen: 'Venta #299', stockResultante: 14 },
        { id: 'MOV-PT010-4', fecha: '24/02/2026', tipo: 'ajuste', cantidad: 1, origen: 'Ajuste manual por control de inventario', stockResultante: 15 },
      ]
    },
    {
      id: 'PT-011', nombre: 'Deck Modular 1x1', categoria: 'Decks',
      descripcion: 'Módulo de deck de 1x1 m en madera de eucalipto tratada para exterior.',
      imagen: 'assets/mesa_nordica.jpg', unidadMedida: 'caja',
      stockActual: 0, stockMinimo: 15, stockMaximo: 120, estado: 'sin_stock',
      ubicacion: 'Depósito Sur - Playón cubierto', ultimaActualizacion: '05/03/2026',
      movimientos: [
        { id: 'MOV-PT011-1', fecha: '07/11/2025', tipo: 'ingreso', cantidad: 60, origen: 'Orden de producción OP-100', stockResultante: 60 },
        { id: 'MOV-PT011-2', fecha: '12/12/2025', tipo: 'egreso', cantidad: 25, origen: 'Venta #282', stockResultante: 35 },
        { id: 'MOV-PT011-3', fecha: '26/01/2026', tipo: 'egreso', cantidad: 20, origen: 'Venta #306', stockResultante: 15 },
        { id: 'MOV-PT011-4', fecha: '05/03/2026', tipo: 'egreso', cantidad: 15, origen: 'Venta #320', stockResultante: 0 },
      ]
    },
    {
      id: 'PT-012', nombre: 'Biblioteca Rincón', categoria: 'Bibliotecas',
      descripcion: 'Biblioteca esquinera de cuatro estantes con terminación laqueada.',
      imagen: 'assets/biblioteca_moderna.webp', unidadMedida: 'unidad',
      stockActual: 12, stockMinimo: 4, stockMaximo: 28, estado: 'optimo',
      ubicacion: 'Depósito Central - Estante B3', ultimaActualizacion: '09/03/2026',
      lote: 'L-2026-021', fechaVencimiento: '03/02/2028',
      movimientos: [
        { id: 'MOV-PT012-1', fecha: '15/10/2025', tipo: 'ingreso', cantidad: 12, origen: 'Orden de producción OP-097', stockResultante: 12 },
        { id: 'MOV-PT012-2', fecha: '27/11/2025', tipo: 'egreso', cantidad: 3, origen: 'Venta #276', stockResultante: 9 },
        { id: 'MOV-PT012-3', fecha: '03/02/2026', tipo: 'ingreso', cantidad: 8, origen: 'Orden de producción OP-113', stockResultante: 17 },
        { id: 'MOV-PT012-4', fecha: '09/03/2026', tipo: 'egreso', cantidad: 5, origen: 'Venta #323', stockResultante: 12 },
      ]
    },
    {
      id: 'PT-013', nombre: 'Cómoda Infantil', categoria: 'Cómodas',
      descripcion: 'Cómoda de tres cajones en tonos pastel, bordes redondeados.',
      imagen: 'assets/comoda_6_cajones.webp', unidadMedida: 'unidad',
      stockActual: 6, stockMinimo: 6, stockMaximo: 32, estado: 'bajo_minimo',
      ubicacion: 'Depósito Norte - Sector C', ultimaActualizacion: '13/03/2026',
      movimientos: [
        { id: 'MOV-PT013-1', fecha: '22/10/2025', tipo: 'ingreso', cantidad: 20, origen: 'Orden de producción OP-098', stockResultante: 20 },
        { id: 'MOV-PT013-2', fecha: '04/12/2025', tipo: 'egreso', cantidad: 6, origen: 'Venta #278', stockResultante: 14 },
        { id: 'MOV-PT013-3', fecha: '30/01/2026', tipo: 'egreso', cantidad: 5, origen: 'Venta #308', stockResultante: 9 },
        { id: 'MOV-PT013-4', fecha: '13/03/2026', tipo: 'egreso', cantidad: 3, origen: 'Venta #326', stockResultante: 6 },
      ]
    },
    {
      id: 'PT-014', nombre: 'Rack TV Flotante', categoria: 'Racks',
      descripcion: 'Rack flotante de 1.20 m con soporte oculto y cajón central.',
      imagen: 'assets/rack_tv.jpg', unidadMedida: 'unidad',
      stockActual: 17, stockMinimo: 5, stockMaximo: 40, estado: 'optimo',
      ubicacion: 'Depósito Central - Estante D2', ultimaActualizacion: '12/03/2026',
      lote: 'L-2026-030', fechaVencimiento: '17/02/2028',
      movimientos: [
        { id: 'MOV-PT014-1', fecha: '11/11/2025', tipo: 'ingreso', cantidad: 18, origen: 'Orden de producción OP-102', stockResultante: 18 },
        { id: 'MOV-PT014-2', fecha: '23/12/2025', tipo: 'egreso', cantidad: 4, origen: 'Venta #289', stockResultante: 14 },
        { id: 'MOV-PT014-3', fecha: '17/02/2026', tipo: 'ingreso', cantidad: 9, origen: 'Orden de producción OP-117', stockResultante: 23 },
        { id: 'MOV-PT014-4', fecha: '12/03/2026', tipo: 'egreso', cantidad: 6, origen: 'Venta #325', stockResultante: 17 },
      ]
    },
    {
      id: 'PT-015', nombre: 'Silla Plegable de Pino', categoria: 'Sillas',
      descripcion: 'Silla plegable de pino para eventos, en caja de seis unidades.',
      imagen: 'assets/banqueta_alta.jpg', unidadMedida: 'caja',
      stockActual: 30, stockMinimo: 10, stockMaximo: 90, estado: 'optimo',
      ubicacion: 'Depósito Sur - Playón cubierto', ultimaActualizacion: '16/03/2026',
      movimientos: [
        { id: 'MOV-PT015-1', fecha: '18/09/2025', tipo: 'ingreso', cantidad: 45, origen: 'Orden de producción OP-087', stockResultante: 45 },
        { id: 'MOV-PT015-2', fecha: '29/10/2025', tipo: 'egreso', cantidad: 11, origen: 'Venta #262', stockResultante: 34 },
        { id: 'MOV-PT015-3', fecha: '07/12/2025', tipo: 'egreso', cantidad: 8, origen: 'Venta #280', stockResultante: 26 },
        { id: 'MOV-PT015-4', fecha: '02/02/2026', tipo: 'ingreso', cantidad: 15, origen: 'Orden de producción OP-112', stockResultante: 41 },
        { id: 'MOV-PT015-5', fecha: '07/03/2026', tipo: 'egreso', cantidad: 9, origen: 'Venta #322', stockResultante: 32 },
        { id: 'MOV-PT015-6', fecha: '16/03/2026', tipo: 'ajuste', cantidad: 2, origen: 'Ajuste manual por diferencia de conteo', stockResultante: 30 },
      ]
    },
    {
      id: 'PT-016', nombre: 'Banqueta Baja de Roble', categoria: 'Banquetas',
      descripcion: 'Banqueta baja de roble macizo, sin respaldo, apilable.',
      imagen: 'assets/banqueta_alta.jpg', unidadMedida: 'unidad',
      stockActual: 3, stockMinimo: 8, stockMaximo: 48, estado: 'bajo_minimo',
      ubicacion: 'Depósito Norte - Sector A', ultimaActualizacion: '14/03/2026',
      movimientos: [
        { id: 'MOV-PT016-1', fecha: '24/10/2025', tipo: 'ingreso', cantidad: 24, origen: 'Orden de producción OP-103', stockResultante: 24 },
        { id: 'MOV-PT016-2', fecha: '05/12/2025', tipo: 'egreso', cantidad: 9, origen: 'Venta #284', stockResultante: 15 },
        { id: 'MOV-PT016-3', fecha: '01/02/2026', tipo: 'egreso', cantidad: 7, origen: 'Venta #310', stockResultante: 8 },
        { id: 'MOV-PT016-4', fecha: '14/03/2026', tipo: 'egreso', cantidad: 5, origen: 'Venta #327', stockResultante: 3 },
      ]
    },
  ];

  obtenerProductosTerminados(): ProductoTerminado[] {
    return [...this.productosTerminados];
  }

  obtenerPorId(id: string): ProductoTerminado | undefined {
    return this.productosTerminados.find(pt => pt.id === id);
  }

  filtrar(filtros: FiltroProductoTerminado): ProductoTerminado[] {
    const busqueda = this.normalizar(filtros.busqueda ?? '');

    return this.productosTerminados.filter(pt => {
      if (busqueda && !this.normalizar(pt.id).includes(busqueda) && !this.normalizar(pt.nombre).includes(busqueda)) return false;
      if (filtros.categoria && pt.categoria !== filtros.categoria) return false;
      if (filtros.soloStockBajo && pt.estado === 'optimo') return false;
      if (filtros.stockDesde !== undefined && pt.stockActual < filtros.stockDesde) return false;
      if (filtros.stockHasta !== undefined && pt.stockActual > filtros.stockHasta) return false;
      return true;
    });
  }

  obtenerCategorias(): string[] {
    const categorias = new Set(this.productosTerminados.map(pt => pt.categoria));
    return [...categorias].sort((a, b) => a.localeCompare(b));
  }

  obtenerResumenAlertas(): ResumenAlertas {
    const bajoMinimo = this.productosTerminados.filter(pt => pt.estado === 'bajo_minimo').length;
    const sinStock = this.productosTerminados.filter(pt => pt.estado === 'sin_stock').length;
    return { bajoMinimo, sinStock, total: bajoMinimo + sinStock };
  }

  private normalizar(texto: string): string {
    return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
  }
}
