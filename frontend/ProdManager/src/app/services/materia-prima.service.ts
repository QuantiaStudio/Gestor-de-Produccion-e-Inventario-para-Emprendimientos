import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EstadoMateriaPrima, MateriaPrima, MateriaPrimaApi, TipoMovimientoStock } from '../models/materia-prima/materia-prima.model';
import { environment } from '../../environments/environment';
import { Observable, map, shareReplay, tap } from 'rxjs';

// La consulta (listado y detalle) ya se conecta al backend real de Django (TK-02-08).
const DJANGO_LIST_URL = `${environment.djangoApiUrl}/materias-primas/`;

// El alta, la edición y la eliminación de materias primas están postergadas para este
// sprint (ver alcance de HU01), así que siguen apoyadas en la API de prueba hasta que
// el backend las incorpore.
const API_URL = `${environment.apiUrl}/materiasPrimas`;

@Injectable({
  providedIn: 'root'
})
export class MateriaPrimaService {
  private materiasPrimas: MateriaPrima[] = [];
  readonly materiasPrimas$: Observable<MateriaPrima[]>;

  constructor(private http: HttpClient) {
    this.materiasPrimas$ = this.http.get<MateriaPrimaApi[]>(DJANGO_LIST_URL).pipe(
      map(materias => materias.map(mp => this.mapearDesdeApi(mp))),
      tap(materias => {
        this.materiasPrimas = materias;
      }),
      shareReplay(1)
    );
  }

  private mapearDesdeApi(mp: MateriaPrimaApi): MateriaPrima {
    // Django (DRF) serializa los campos Decimal como string (ej. "120.00") para no
    // perder precisión; hay que convertirlos a number antes de compararlos.
    const stockActual = Number(mp.stock_actual);
    const stockMinimo = Number(mp.stock_minimo);

    return {
      id: String(mp.id),
      nombre: mp.nombre,
      descripcion: mp.descripcion,
      unidadMedida: mp.unidad_medida,
      stockTotal: stockActual,
      stockDisponible: stockActual,
      stockMinimo: stockMinimo,
      estado: this.calcularEstado(stockActual, stockMinimo),
      // El backend todavía no expone un endpoint de movimientos de materia prima.
      ultimaActualizacion: '',
    };
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
