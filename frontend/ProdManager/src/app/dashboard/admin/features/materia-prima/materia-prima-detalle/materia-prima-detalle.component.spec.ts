import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MateriaPrimaDetalleComponent } from './materia-prima-detalle.component';

describe('MateriaPrimaDetalleComponent', () => {
  let component: MateriaPrimaDetalleComponent;
  let fixture: ComponentFixture<MateriaPrimaDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MateriaPrimaDetalleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MateriaPrimaDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
