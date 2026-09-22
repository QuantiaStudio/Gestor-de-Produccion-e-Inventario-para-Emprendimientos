import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MovimientoStock, MovimientoStockApi, TipoMovimientoStock } from '../models/materia-prima/materia-prima.model';
import { AuthService } from '../auth/services/auth.service';
import { environment } from '../../environments/environment';

const API_URL = `${environment.apiUrl}/movimientosStockMateriaPrima`;

@Injectable({
  providedIn: 'root'
})
export class MovimientoStockService {
  private movimientos: MovimientoStock[] = [];

  constructor(private http: HttpClient, private authService: AuthService) {
    this.http.get<MovimientoStockApi[]>(API_URL).subscribe(movimientosApi => {
      this.movimientos.push(...movimientosApi.map(m => this.mapearDesdeApi(m)));
    });
  }

  private mapearDesdeApi(m: MovimientoStockApi): MovimientoStock {
    return {
      id: String(m.id_movimiento),
      materiaPrimaId: String(m.id_materia_prima),
      fecha: m.fecha,
      tipo: m.tipo_movimiento,
      cantidad: m.cantidad,
      // db.json no guarda el stock resultante de cada movimiento; se calcula al momento de registrarlo.
      stockResultante: 0,
    };
  }

  obtenerMovimientos(): MovimientoStock[] {
    return this.movimientos;
  }

  obtenerPorMateriaPrima(materiaPrimaId: string): MovimientoStock[] {
    return this.movimientos.filter(m => m.materiaPrimaId === materiaPrimaId);
  }

  registrarMovimiento(materiaPrimaId: string, tipo: TipoMovimientoStock, cantidad: number, stockResultante: number, observacion = ''): MovimientoStock {
    const nuevoId = this.calcularProximoId();

    const movimiento: MovimientoStock = {
      id: String(nuevoId),
      materiaPrimaId,
      fecha: new Date().toISOString(),
      tipo,
      cantidad,
      stockResultante,
    };

    const usuarioActual = this.authService.getUsuarioActual();

    // json-server necesita un campo "id" para rutear /recurso/:id; lo mandamos
    // en el mismo valor que id_movimiento (la clave real según el DER) para
    // no depender del autoincremento propio de json-server.
    const payload: MovimientoStockApi & { id: number } = {
      id: nuevoId,
      id_movimiento: nuevoId,
      id_materia_prima: Number(materiaPrimaId),
      fecha: movimiento.fecha,
      tipo_movimiento: tipo,
      cantidad,
      observacion,
      id_usuario: Number(usuarioActual?.id) || 1,
    };

    this.http.post(API_URL, payload).subscribe();

    this.movimientos.push(movimiento);
    return movimiento;
  }

  private calcularProximoId(): number {
    return this.movimientos.reduce((maximo, m) => Math.max(maximo, Number(m.id)), 0) + 1;
  }
}
