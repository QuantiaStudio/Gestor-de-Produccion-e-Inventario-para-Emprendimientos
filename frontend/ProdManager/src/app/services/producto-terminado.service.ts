import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';
import { environment } from '../../environments/environment';
import { CategoriaBackendDTO, EstadoProductoTerminado, FiltroProductoTerminado, MaterialAgregadoProducto, MovimientoInventario, MovimientoInventarioApiDTO, NuevoProductoFormValue, ProductoApiDTO, ProductoBackendDTO, ProductoTerminado, ResumenInventario } from '../models/producto/producto-terminado.model';

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
  private readonly backendProductosUrl = `${environment.djangoApiUrl}/productos/`;
  private readonly backendCategoriasUrl = `${environment.djangoApiUrl}/categorias/`;
  private readonly backendMovimientosUrl = `${environment.djangoApiUrl}/movimientos-producto/`;
  private categorias = new Map<number, string>();
  private productosTerminados: ProductoTerminado[] = [];

  obtenerProductosTerminados(): ProductoTerminado[] {
    return [...this.productosTerminados];
  }

  cargarProductosTerminados(): Observable<ProductoTerminado[]> {
    return forkJoin({
      productos: this.http.get<ProductoBackendDTO[]>(this.backendProductosUrl),
      movimientos: this.http.get<MovimientoInventarioApiDTO[]>(this.backendMovimientosUrl),
      categorias: this.http.get<CategoriaBackendDTO[]>(this.backendCategoriasUrl)
    }).pipe(
      map(({ productos, movimientos, categorias }) => {
        this.categorias = new Map(categorias.map(categoria => [categoria.id_categoria, categoria.nombre]));
        return productos.map(producto => this.mapearProductoBackend(producto, movimientos));
      }),
      tap(productos => this.productosTerminados = productos)
    );
  }

  /** Categorías del backend Django, para el alta de productos. */
  obtenerCategoriasDelBackend(): Observable<CategoriaBackendDTO[]> {
    return this.http.get<CategoriaBackendDTO[]>(this.backendCategoriasUrl);
  }

  /**
   * Crea el producto con su fórmula en el backend Django (POST /productos/, backend/API.md §7.2).
   * El producto nace con stock 0: el stock cambia con movimientos o al finalizar producción.
   */
  crearProducto(producto: ProductoBackendDTO): Observable<ProductoBackendDTO> {
    return this.http.post<ProductoBackendDTO>(this.backendProductosUrl, producto);
  }

  eliminarProducto(id: number): Observable<void> {
    return this.http.delete<void>(`${this.backendProductosUrl}${id}/`);
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

  private mapearProductoBackend(
    producto: ProductoBackendDTO,
    movimientosInventario: MovimientoInventarioApiDTO[]
  ): ProductoTerminado {
    const idProducto = Number(producto.id_producto);
    const stockActual = Number(producto.stock_actual ?? 0);

    return {
      id: producto.codigo,
      apiId: idProducto,
      nombre: producto.nombre,
      categoria: this.categorias.get(producto.id_categoria) ?? '',
      descripcion: producto.descripcion,
      imagen: this.resolverImagen(producto.imagen),
      unidadMedida: 'unidad',
      stockActual,
      stockMinimo: Number(producto.stock_minimo),
      estado: producto.estado,
      ultimaActualizacion: this.fechaDeHoy(),
      formula: producto.formula.map(material => ({
        materiaPrimaId: `M${String(material.id_materia_prima).padStart(3, '0')}`,
        nombreMateriaPrima: material.nombre_materia_prima ?? `Materia prima ${material.id_materia_prima}`,
        cantidad: Number(material.cantidad_necesaria)
      })),
      movimientos: this.mapearMovimientosProducto(idProducto, movimientosInventario)
    };
  }

  private resolverImagen(imagen?: string | null): string {
    const referencia = imagen?.trim();
    if (!referencia) return '/assets/box.svg';
    if (/^https?:\/\//i.test(referencia)) return referencia;

    const rutaAssets = referencia.replace(/^\/?assets\//, '');
    return `/assets/${rutaAssets}`;
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

  obtenerEstados(): EstadoProductoTerminado[] {
    return [...new Set(this.productosTerminados.map(producto => producto.estado))];
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

  private fechaDeHoy(): string {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    return `${dia}/${mes}/${hoy.getFullYear()}`;
  }

  private normalizar(texto: string): string {
    return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
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
