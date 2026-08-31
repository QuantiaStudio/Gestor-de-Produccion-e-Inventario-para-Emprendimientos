import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductoTerminadoDetalleComponent } from './producto-terminado-detalle.component';
import { ProductoTerminadoService } from '../../../../../services/producto-terminado.service';

describe('ProductoTerminadoDetalleComponent', () => {
  let component: ProductoTerminadoDetalleComponent;
  let fixture: ComponentFixture<ProductoTerminadoDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductoTerminadoDetalleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductoTerminadoDetalleComponent);
    component = fixture.componentInstance;
    const productos = TestBed.inject(ProductoTerminadoService).obtenerProductosTerminados();
    fixture.componentRef.setInput('producto', productos[0]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
