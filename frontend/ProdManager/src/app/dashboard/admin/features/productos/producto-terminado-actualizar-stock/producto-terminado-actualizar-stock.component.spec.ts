import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductoTerminadoActualizarStockComponent } from './producto-terminado-actualizar-stock.component';

describe('ProductoTerminadoActualizarStockComponent', () => {
  let component: ProductoTerminadoActualizarStockComponent;
  let fixture: ComponentFixture<ProductoTerminadoActualizarStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductoTerminadoActualizarStockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductoTerminadoActualizarStockComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('productos', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
