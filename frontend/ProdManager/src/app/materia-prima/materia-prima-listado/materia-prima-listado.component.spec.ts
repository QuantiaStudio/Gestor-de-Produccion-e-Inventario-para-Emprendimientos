import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MateriaPrimaListadoComponent } from './materia-prima-listado.component';

describe('MateriaPrimaListadoComponent', () => {
  let component: MateriaPrimaListadoComponent;
  let fixture: ComponentFixture<MateriaPrimaListadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MateriaPrimaListadoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MateriaPrimaListadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
