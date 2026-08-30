import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductoTerminadoAlertasComponent } from './producto-terminado-alertas.component';

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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
