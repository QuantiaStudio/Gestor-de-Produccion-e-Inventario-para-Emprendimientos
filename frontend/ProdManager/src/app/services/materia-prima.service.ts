import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EstadoMateriaPrima, MateriaPrima, MateriaPrimaApi, MovimientoStockApi, TipoMovimientoStock } from '../models/materia-prima/materia-prima.model';
import { environment } from '../../environments/environment';
import { Observable, forkJoin, map, shareReplay, tap } from 'rxjs';

const API_URL = `${environment.apiUrl}/materiasPrimas`;
const MOVIMIENTOS_URL = `${environment.apiUrl}/movimientosStockMateriaPrima`;

@Injectable({
  providedIn: 'root'
})
export class MateriaPrimaService {
  private materiasPrimas: MateriaPrima[] = [];
  readonly materiasPrimas$: Observable<MateriaPrima[]>;

  constructor(private http: HttpClient) {
    this.materiasPrimas$ = forkJoin({
      materias: this.http.get<MateriaPrimaApi[]>(API_URL),
      movimientos: this.http.get<MovimientoStockApi[]>(MOVIMIENTOS_URL),
    }).pipe(
      map(({ materias, movimientos }) => materias.map(mp => this.mapearDesdeApi(mp, movimientos))),
      tap(materias => {
        this.materiasPrimas = materias;
      }),
      shareReplay(1)
    );
  }

  private mapearDesdeApi(mp: MateriaPrimaApi, movimientos: MovimientoStockApi[]): MateriaPrima {
    return {
      id: String(mp.id_materia_prima),
      nombre: mp.nombre,
      descripcion: mp.descripcion,
      unidadMedida: mp.unidad_medida,
      stockTotal: mp.stock_actual,
      stockDisponible: mp.stock_actual,
      stockMinimo: mp.stock_minimo,
      estado: this.calcularEstado(mp.stock_actual, mp.stock_minimo),
      ultimaActualizacion: this.ultimaFechaDeMovimiento(mp.id_materia_prima, movimientos),
    };
  }

  private ultimaFechaDeMovimiento(idMateriaPrima: number, movimientos: MovimientoStockApi[]): string {
    const fechas = movimientos
      .filter(m => m.id_materia_prima === idMateriaPrima)
      .map(m => new Date(m.fecha).getTime());
    if (fechas.length === 0) return '';
    return new Date(Math.max(...fechas)).toLocaleDateString('es-AR');
  }

  obtenerMateriasPrimas(): MateriaPrima[] {
    return this.materiasPrimas;
  }

  obtenerMateriasPrimas$(): Observable<MateriaPrima[]> {
    return this.materiasPrimas$;
  }

  obtenerPorId(id: string): MateriaPrima | undefined {
    return this.materiasPrimas.find(mp => mp.id === id);
  }

  actualizarStock(id: string, stockTotal: number, stockMinimo: number): void {
    const materiaPrima = this.obtenerPorId(id);
    if (!materiaPrima) return;

    materiaPrima.stockTotal = stockTotal;
    materiaPrima.stockDisponible = stockTotal;
    materiaPrima.stockMinimo = stockMinimo;
    materiaPrima.estado = this.calcularEstado(stockTotal, stockMinimo);
    materiaPrima.ultimaActualizacion = new Date().toLocaleDateString('es-AR');

    this.http.patch(`${API_URL}/${id}`, {
      stock_actual: stockTotal,
      stock_minimo: stockMinimo,
    }).subscribe();
  }

  registrarMovimiento(id: string, tipo: TipoMovimientoStock, cantidad: number): number | undefined {
    const materiaPrima = this.obtenerPorId(id);
    if (!materiaPrima) return undefined;

    const delta = tipo === 'ingreso' ? cantidad : -cantidad;
    materiaPrima.stockTotal += delta;
    materiaPrima.stockDisponible += delta;
    materiaPrima.estado = this.calcularEstado(materiaPrima.stockTotal, materiaPrima.stockMinimo);
    materiaPrima.ultimaActualizacion = new Date().toLocaleDateString('es-AR');

    this.http.patch(`${API_URL}/${id}`, { stock_actual: materiaPrima.stockTotal }).subscribe();

    return materiaPrima.stockDisponible;
  }

  eliminar(id: string): void {
    const indice = this.materiasPrimas.findIndex(mp => mp.id === id);
    if (indice !== -1) this.materiasPrimas.splice(indice, 1);

    this.http.delete(`${API_URL}/${id}`).subscribe();
  }

  private calcularEstado(stockTotal: number, stockMinimo: number): EstadoMateriaPrima {
    if (stockTotal === 0) return 'sin_stock';
    if (stockTotal <= stockMinimo) return 'bajo_minimo';
    return 'optimo';
  }

}
