import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { DashboardResumen } from '../models/dashboard/dashboard-resumen.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly resumenUrl = `${environment.djangoApiUrl}/dashboard/resumen/`;

  constructor(private readonly http: HttpClient) {}

  obtenerResumen(): Observable<DashboardResumen> {
    return this.http.get<{
      usuarios_activos: number;
      productos_en_produccion: number;
      disenos_catalogo: number;
    }>(this.resumenUrl).pipe(map(resumen => ({
        usuariosActivos: resumen.usuarios_activos,
        productosEnProduccion: resumen.productos_en_produccion,
        disenosCatalogo: resumen.disenos_catalogo
      })));
  }
}
