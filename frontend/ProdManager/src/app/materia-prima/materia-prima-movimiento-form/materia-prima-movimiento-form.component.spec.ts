import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MateriaPrimaMovimientoFormComponent } from './materia-prima-movimiento-form.component';

describe('MateriaPrimaMovimientoFormComponent', () => {
  let component: MateriaPrimaMovimientoFormComponent;
  let fixture: ComponentFixture<MateriaPrimaMovimientoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MateriaPrimaMovimientoFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MateriaPrimaMovimientoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
