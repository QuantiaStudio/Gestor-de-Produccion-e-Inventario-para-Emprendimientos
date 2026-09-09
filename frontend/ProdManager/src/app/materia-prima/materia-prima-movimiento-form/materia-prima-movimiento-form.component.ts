import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MateriaPrima } from '../../models/materia-prima/materia-prima.model';

@Component({
  selector: 'app-materia-prima-movimiento-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './materia-prima-movimiento-form.component.html',
  styleUrl: './materia-prima-movimiento-form.component.css'
})
export class MateriaPrimaMovimientoFormComponent {
  @Input({ required: true }) materiasPrimas!: MateriaPrima[];
  @Output() cerrar = new EventEmitter<void>();

  formMovimiento = new FormGroup({
    materiaPrimaId: new FormControl('', Validators.required),
    tipo: new FormControl<'ingreso' | 'consumo'>('ingreso', Validators.required),
    cantidad: new FormControl<number | null>(null, Validators.required),
  });
}
