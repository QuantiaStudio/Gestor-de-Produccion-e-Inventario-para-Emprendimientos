import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductoTerminadoListadoComponent } from './producto-terminado-listado.component';

describe('ProductoTerminadoListadoComponent', () => {
  let component: ProductoTerminadoListadoComponent;
  let fixture: ComponentFixture<ProductoTerminadoListadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductoTerminadoListadoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductoTerminadoListadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
