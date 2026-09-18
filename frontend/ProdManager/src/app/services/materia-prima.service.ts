import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EstadoMateriaPrima, MateriaPrima, MateriaPrimaApi, TipoMovimientoStock } from '../models/materia-prima/materia-prima.model';
import { environment } from '../../environments/environment';
import { map, shareReplay, tap } from 'rxjs';

const API_URL = `${environment.apiUrl}/materiasPrimas`;

@Injectable({
  providedIn: 'root'
})
export class MateriaPrimaService {
  private materiasPrimas: MateriaPrima[] = [];

  constructor(private http: HttpClient) {}

  private mapearDesdeApi(mp: MateriaPrimaApi): MateriaPrima {
    return {
      id: String(mp.id_materia_prima),
      nombre: mp.nombre,
      descripcion: mp.descripcion,
      unidadMedida: mp.unidad_medida,
      stockTotal: mp.stock_actual,
      stockDisponible: mp.stock_actual,
      stockMinimo: mp.stock_minimo,
      estado: this.calcularEstado(mp.stock_actual, mp.stock_minimo),
      // db.json todavía no tiene estos campos; se completan por defecto.
      categoria: '',
      proveedor: '',
      ultimaActualizacion: '',
    };
  }

  obtenerMateriasPrimas(): MateriaPrima[] {
    return this.materiasPrimas;
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
    materiaPrima.ultimaActualizacion = new Date().toLocaleDateString();

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
    materiaPrima.ultimaActualizacion = new Date().toLocaleDateString();

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

  materiasPrimas$ = this.http.get<MateriaPrimaApi[]>(API_URL).pipe(
    map(materias => materias.map(mp => this.mapearDesdeApi(mp))),
    tap(materias => {
      this.materiasPrimas = materias;
    }),
    shareReplay(1)
  );
}
