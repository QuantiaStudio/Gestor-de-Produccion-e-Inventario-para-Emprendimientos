import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductoTerminadoAlertasComponent } from './producto-terminado-alertas.component';
import { ProductoTerminadoService } from '../../../../../services/producto-terminado.service';

describe('ProductoTerminadoAlertasComponent', () => {
  let component: ProductoTerminadoAlertasComponent;
  let fixture: ComponentFixture<ProductoTerminadoAlertasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductoTerminadoAlertasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductoTerminadoAlertasComponent);
    component = fixture.componentInstance;
    const resumen = TestBed.inject(ProductoTerminadoService).obtenerResumenInventario();
    fixture.componentRef.setInput('resumen', resumen);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
