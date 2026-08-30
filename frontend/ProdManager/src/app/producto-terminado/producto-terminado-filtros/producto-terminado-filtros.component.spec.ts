import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductoTerminadoFiltrosComponent } from './producto-terminado-filtros.component';

describe('ProductoTerminadoFiltrosComponent', () => {
  let component: ProductoTerminadoFiltrosComponent;
  let fixture: ComponentFixture<ProductoTerminadoFiltrosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductoTerminadoFiltrosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductoTerminadoFiltrosComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('categorias', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
