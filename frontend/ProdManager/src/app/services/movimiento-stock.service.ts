import { Injectable } from '@angular/core';
import { MovimientoStock, TipoMovimientoStock } from '../models/materia-prima/materia-prima.model';

@Injectable({
  providedIn: 'root'
})
export class MovimientoStockService {
  private movimientos: MovimientoStock[] = [];

  obtenerMovimientos(): MovimientoStock[] {
    return this.movimientos;
  }

  obtenerPorMateriaPrima(materiaPrimaId: string): MovimientoStock[] {
    return this.movimientos.filter(m => m.materiaPrimaId === materiaPrimaId);
  }

  registrarMovimiento(materiaPrimaId: string, tipo: TipoMovimientoStock, cantidad: number, stockResultante: number): MovimientoStock {
    const movimiento: MovimientoStock = {
      id: `MOV${(this.movimientos.length + 1).toString().padStart(3, '0')}`,
      materiaPrimaId,
      fecha: new Date().toLocaleDateString(),
      tipo,
      cantidad,
      stockResultante,
    };

    this.movimientos.push(movimiento);
    return movimiento;
  }
}
