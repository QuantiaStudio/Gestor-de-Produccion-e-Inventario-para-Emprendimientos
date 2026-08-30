import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductoTerminadoDetalleComponent } from './producto-terminado-detalle.component';

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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
