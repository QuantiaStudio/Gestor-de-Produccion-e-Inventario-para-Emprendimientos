import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';
import { environment } from '../../environments/environment';
import { CategoriaApiDTO, EstadoProductoTerminado, FiltroProductoTerminado, MaterialAgregadoProducto, MovimientoInventario, MovimientoInventarioApiDTO, NuevoProductoFormValue, ProductoApiDTO, ProductoTerminado, ResumenInventario } from '../models/producto/producto-terminado.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoTerminadoService {
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }
  private readonly productosUrl = `${environment.apiUrl}/productos`;
  private readonly movimientosInventarioUrl = `${environment.apiUrl}/movimientosInventarioProducto`;
  private readonly categoriasUrl = `${environment.apiUrl}/categorias`;
  private categorias = new Map<number, string>();
  private productosTerminados: ProductoTerminado[] = [];

  obtenerProductosTerminados(): ProductoTerminado[] {
    return [...this.productosTerminados];
  }

  cargarProductosTerminados(): Observable<ProductoTerminado[]> {
    return forkJoin({
      productos: this.http.get<ProductoApiDTO[]>(this.productosUrl),
      movimientos: this.http.get<MovimientoInventarioApiDTO[]>(this.movimientosInventarioUrl),
      categorias: this.http.get<CategoriaApiDTO[]>(this.categoriasUrl)
    }).pipe(
      map(({ productos, movimientos, categorias }) => {
        this.categorias = new Map(categorias.map(categoria => [categoria.id, categoria.nombre]));
        return productos.map(producto => this.mapearProducto(producto, movimientos));
      }),
      tap(productos => this.productosTerminados = productos)
    );
  }

  crearProducto(
    formValue: NuevoProductoFormValue,
    materialesAgregados: MaterialAgregadoProducto[]
  ): Observable<ProductoApiDTO> {
    const stockActual = formValue.stockInicial ?? 0;
    const stockMinimo = formValue.stockMinimo ?? 1;
    const stockMaximo = formValue.stockMaximo ?? Math.max(stockActual * 2, stockActual);
    const fechaActual = new Date().toLocaleDateString();

    const producto: ProductoTerminado = {
      id: formValue.codigo ?? this.generarNuevoId(),
      nombre: formValue.nombre ?? '',
      categoria: formValue.categoria ?? '',
      descripcion: formValue.descripcion ?? '',
      imagen: formValue.imagen ?? '',
      unidadMedida: 'unidad',
      stockActual,
      stockMinimo,
      stockMaximo,
      estado: 'pendiente',
      ultimaActualizacion: fechaActual,
      formula: materialesAgregados.map(material => ({
        materiaPrimaId: material.materiaPrimaId,
        nombreMateriaPrima: material.nombre,
        cantidad: material.cantidadMaterial
      })),
      movimientos: stockActual > 0
        ? [{
          id: `MOV-${formValue.codigo ?? 'PT'}-1`,
          fecha: fechaActual,
          tipo: 'ingreso',
          cantidad: stockActual,
          origen: 'Alta inicial de producto',
          stockResultante: stockActual
        }]
        : []
    };

    const payload: ProductoApiDTO = {
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      stock_actual: producto.stockActual,
      stock_minimo: producto.stockMinimo,
      stock_maximo: producto.stockMaximo,
      id_categoria: this.obtenerIdCategoria(producto.categoria),
      estado: producto.estado,
      codigo: producto.id,
      imagen: producto.imagen,
      formula: producto.formula.map(material => ({
        id_materia_prima: Number(material.materiaPrimaId.replace('M', '')),
        nombre_materia_prima: material.nombreMateriaPrima,
        cantidad: material.cantidad
      }))
    };

    return this.http.post<ProductoApiDTO>(
      this.productosUrl,
      payload
    ).pipe(
      switchMap(respuesta => {
        const productoPersistido = this.mapearProducto({ ...payload, ...respuesta }, [], producto);
        this.productosTerminados = [productoPersistido, ...this.productosTerminados];

        if (stockActual > 0 && respuesta.id) {
          const movimientoAlta: MovimientoInventarioApiDTO = {
            fecha: new Date().toISOString(),
            tipo_movimiento: 'ingreso',
            cantidad: stockActual,
            id_producto: Number(respuesta.id),
            id_usuario: this.obtenerIdUsuarioActual(),
            observacion: 'Alta inicial de producto'
          };

          return this.http.post<MovimientoInventarioApiDTO>(this.movimientosInventarioUrl, movimientoAlta).pipe(
            map(() => respuesta)
          );
        }

        return of(respuesta);
      })
    );
  }

  eliminarProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.productosUrl}/${id}`);
  }

  actualizarProducto(
    producto: ProductoTerminado,
    formValue: NuevoProductoFormValue,
    materialesAgregados: MaterialAgregadoProducto[]
  ): Observable<ProductoApiDTO> {
    const payload: ProductoApiDTO = {
      id: producto.apiId,
      nombre: formValue.nombre ?? '',
      descripcion: formValue.descripcion ?? '',
      stock_actual: formValue.stockInicial ?? producto.stockActual,
      stock_minimo: formValue.stockMinimo ?? producto.stockMinimo,
      stock_maximo: formValue.stockMaximo ?? producto.stockMaximo,
      id_categoria: this.obtenerIdCategoria(formValue.categoria ?? producto.categoria),
      estado: producto.estado,
      codigo: formValue.codigo ?? producto.id,
      imagen: formValue.imagen ?? producto.imagen,
      formula: materialesAgregados.map(material => ({
        id_materia_prima: Number(material.materiaPrimaId.replace('M', '')),
        nombre_materia_prima: material.nombre,
        cantidad: material.cantidadMaterial
      }))
    };

    return this.http.put<ProductoApiDTO>(`${this.productosUrl}/${producto.apiId}`, payload).pipe(
      switchMap(respuesta => {
        if (!producto.apiId) return of(respuesta);

        const movimientoModificacion: MovimientoInventarioApiDTO = {
          fecha: new Date().toISOString(),
          tipo_movimiento: 'modificacion',
          cantidad: Number(formValue.stockInicial ?? producto.stockActual) - producto.stockActual,
          id_producto: producto.apiId,
          id_usuario: this.obtenerIdUsuarioActual(),
          observacion: 'Producto modificado'
        };

        return this.http.post<MovimientoInventarioApiDTO>(
          this.movimientosInventarioUrl,
          movimientoModificacion
        ).pipe(map(() => respuesta));
      })
    );
  }

  private mapearProducto(
    apiProducto: ProductoApiDTO,
    movimientosInventario: MovimientoInventarioApiDTO[] = [],
    productoLocal?: ProductoTerminado
  ): ProductoTerminado {
    const stockActual = Number(apiProducto.stock_actual ?? 0);
    const stockMinimo = Number(apiProducto.stock_minimo ?? productoLocal?.stockMinimo ?? 1);
    const productoId = Number(apiProducto.id ?? 0);

    return {
      id: apiProducto.codigo ?? productoLocal?.id ?? `PT-${String(apiProducto.id ?? 0).padStart(3, '0')}`,
      apiId: apiProducto.id ?? productoLocal?.apiId,
      nombre: apiProducto.nombre ?? '',
      categoria: this.categorias.get(apiProducto.id_categoria) ?? productoLocal?.categoria ?? '',
      descripcion: apiProducto.descripcion ?? '',
      imagen: apiProducto.imagen ?? productoLocal?.imagen ?? '',
      unidadMedida: productoLocal?.unidadMedida ?? '',
      stockActual,
      stockMinimo,
      stockMaximo: Number(apiProducto.stock_maximo ?? productoLocal?.stockMaximo ?? Math.max(stockActual * 2, stockActual)),
      estado: this.normalizarEstado(apiProducto.estado, productoLocal?.estado ?? 'pendiente'),
      ultimaActualizacion: productoLocal?.ultimaActualizacion ?? this.fechaDeHoy(),
      formula: apiProducto.formula?.map(material => ({
        materiaPrimaId: `M${String(material.id_materia_prima).padStart(3, '0')}`,
        nombreMateriaPrima: material.nombre_materia_prima,
        cantidad: material.cantidad
      })) ?? productoLocal?.formula ?? [],
      movimientos: this.mapearMovimientosProducto(productoId, movimientosInventario)
    };
  }

  private mapearMovimientosProducto(
    idProducto: number,
    movimientosInventario: MovimientoInventarioApiDTO[]
  ): MovimientoInventario[] {
    const movimientos = (movimientosInventario ?? [])
      .filter(mov => Number(mov.id_producto) === Number(idProducto))
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    let stockAcumulado = 0;

    return movimientos.map((mov, index) => {
      const tipo = this.mapearTipoMovimiento(mov.tipo_movimiento);
      const cantidad = Math.abs(Number(mov.cantidad ?? 0));
      const stockAnterior = stockAcumulado;

      if (tipo === 'ingreso') {
        stockAcumulado += cantidad;
      } else if (tipo === 'egreso') {
        stockAcumulado -= cantidad;
      } else {
        stockAcumulado += Number(mov.cantidad ?? 0);
      }

      return {
        id: `MOV-${idProducto}-${mov.id_movimiento_producto ?? index + 1}`,
        fecha: this.formatearFecha(mov.fecha),
        tipo,
        cantidad,
        origen: this.origenMovimiento(mov.tipo_movimiento, mov.observacion),
        stockResultante: stockAcumulado || stockAnterior
      };
    });
  }

  private mapearTipoMovimiento(tipoMovimiento: string): MovimientoInventario['tipo'] {
    const tipo = tipoMovimiento?.toLowerCase();

    if (tipo === 'ingreso') return 'ingreso';
    if (tipo === 'venta' || tipo === 'egreso' || tipo === 'consumo') return 'egreso';
    if (tipo === 'ajuste') return 'ajuste';
    if (tipo === 'modificacion') return 'modificacion';

    return 'ajuste';
  }

  private origenMovimiento(tipoMovimiento: string, observacion?: string): string {
    const tipo = tipoMovimiento?.toLowerCase();

    if (tipo === 'ingreso') return observacion ?? 'Alta inicial de producto';
    if (tipo === 'venta') return 'Venta';
    if (tipo === 'consumo') return 'Consumo de producción';
    if (tipo === 'ajuste') return observacion ?? 'Ajuste manual de stock';
    if (tipo === 'modificacion') return observacion ?? 'Producto modificado';

    return observacion ?? 'Movimiento de inventario';
  }

  private formatearFecha(fechaIso: string): string {
    const fecha = new Date(fechaIso);
    if (Number.isNaN(fecha.getTime())) return fechaIso;

    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }

  private obtenerIdCategoria(nombreCategoria: string): number {
    const categoria = [...this.categorias.entries()]
      .find(([, nombre]) => nombre === nombreCategoria);

    return categoria?.[0] ?? 0;
  }

  private obtenerIdUsuarioActual(): number {
    const idUsuario = Number(this.authService.getUsuarioActual()?.id);

    if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
      throw new Error('No hay un usuario autenticado válido para registrar el movimiento.');
    }

    return idUsuario;
  }

  obtenerPorId(id: string): ProductoTerminado | undefined {
    return this.productosTerminados.find(pt => pt.id === id);
  }

  filtrar(filtros: FiltroProductoTerminado): ProductoTerminado[] {
    const busqueda = this.normalizar(filtros.busqueda ?? '');

    return this.productosTerminados.filter(pt => {
      if (busqueda && !this.normalizar(pt.id).includes(busqueda) && !this.normalizar(pt.nombre).includes(busqueda)) return false;
      if (filtros.categoria && pt.categoria !== filtros.categoria) return false;
      if (filtros.estado && !this.coincideEstado(pt, filtros.estado)) return false;
      return true;
    });
  }

  private coincideEstado(
    producto: ProductoTerminado,
    estado: NonNullable<FiltroProductoTerminado['estado']>
  ): boolean {
    if (estado === 'bajo_minimo') {
      return producto.stockActual > 0 && producto.stockActual <= producto.stockMinimo;
    }

    if (estado === 'sin_stock') return producto.stockActual === 0;
    if (estado === 'optimo') return producto.stockActual > producto.stockMinimo;
    return producto.estado === estado;
  }

  obtenerCategorias(): string[] {
    const categorias = new Set(this.productosTerminados.map(pt => pt.categoria));
    return [...categorias].sort((a, b) => a.localeCompare(b));
  }

  obtenerResumenInventario(productos: ProductoTerminado[] = this.productosTerminados): ResumenInventario {
    const bajoMinimo = productos.filter(pt => pt.stockActual > 0 && pt.stockActual <= pt.stockMinimo).length;
    const sinStock = productos.filter(pt => pt.stockActual === 0).length;
    return {
      totalProductos: productos.length,
      unidadesEnStock: productos.reduce((total, pt) => total + pt.stockActual, 0),
      bajoMinimo,
      sinStock,
      enAlerta: bajoMinimo + sinStock
    };
  }

  actualizarStock(id: string, stockActual: number, stockMinimo: number): void {
    const producto = this.obtenerPorId(id);
    if (!producto) return;

    const fecha = this.fechaDeHoy();
    const diferencia = stockActual - producto.stockActual;

    if (diferencia !== 0) {
      const movimiento: MovimientoInventario = {
        id: `MOV-${producto.id.replace('-', '')}-${producto.movimientos.length + 1}`,
        fecha,
        tipo: 'ajuste',
        cantidad: Math.abs(diferencia),
        origen: 'Ajuste manual de stock',
        stockResultante: stockActual
      };
      producto.movimientos.push(movimiento);
    }

    producto.stockActual = stockActual;
    producto.stockMinimo = stockMinimo;
    producto.ultimaActualizacion = fecha;
  }

  private normalizarEstado(
    estado: boolean | EstadoProductoTerminado | undefined,
    fallback: EstadoProductoTerminado = 'pendiente'
  ): EstadoProductoTerminado {
    if (typeof estado === 'string') {
      const valoresValidos: EstadoProductoTerminado[] = [
        'pendiente', 'en_produccion', 'finalizado', 'cancelado'
      ];

      return valoresValidos.includes(estado as EstadoProductoTerminado)
        ? (estado as EstadoProductoTerminado)
        : fallback;
    }

    if (estado === false) return 'cancelado';
    if (estado === true) return 'finalizado';

    return fallback;
  }

  private fechaDeHoy(): string {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    return `${dia}/${mes}/${hoy.getFullYear()}`;
  }

  private normalizar(texto: string): string {
    return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
  }

  private generarNuevoId(): string {
    const ultimoNumero = this.productosTerminados
      .map(pt => Number(pt.id.replace('PT-', '')))
      .filter(numero => !Number.isNaN(numero))
      .reduce((maximo, numero) => Math.max(maximo, numero), 0);

    return `PT-${String(ultimoNumero + 1).padStart(3, '0')}`;
  }

  agregarProduccion(
    id: string,
    cantidad: number,
    origen: string
  ): void {
    const producto = this.obtenerPorId(id);

    if (!producto) {
      throw new Error('El producto no existe.');
    }

    const stockAnterior = producto.stockActual;
    const nuevoStock = stockAnterior + cantidad;
    const fecha = this.fechaDeHoy();

    producto.stockActual = nuevoStock;
    producto.ultimaActualizacion = fecha;

    producto.movimientos.push({
      id: `MOV-${producto.id.replace('-', '')}-${producto.movimientos.length + 1}`,
      fecha,
      tipo: 'ingreso',
      cantidad,
      origen,
      stockResultante: nuevoStock
    });
  }
}
