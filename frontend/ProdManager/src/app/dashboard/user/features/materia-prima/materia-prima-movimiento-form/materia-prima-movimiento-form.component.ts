import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MateriaPrima } from '../../../../../models/materia-prima/materia-prima.model';
import { MateriaPrimaService } from '../../../../../services/materia-prima.service';
import { MovimientoStockService } from '../../../../../services/movimiento-stock.service';

function stockDisponibleValidator(getMateriasPrimas: () => MateriaPrima[]) {
  return (control: AbstractControl): ValidationErrors | null => {
    const tipo = control.get('tipo')?.value;
    const materiaPrimaId = control.get('materiaPrimaId')?.value;
    const cantidad = control.get('cantidad')?.value;

    if (tipo !== 'consumo' || !materiaPrimaId || !cantidad) return null;

    const materiaPrima = getMateriasPrimas().find(mp => mp.id === materiaPrimaId);
    if (materiaPrima && cantidad > materiaPrima.stockDisponible) {
      return { stockInsuficiente: true };
    }
    return null;
  };
}

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
    cantidad: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
  });

  constructor(
    private materiaPrimaService: MateriaPrimaService,
    private movimientoStockService: MovimientoStockService,
  ) {
    this.formMovimiento.setValidators(stockDisponibleValidator(() => this.materiasPrimas));
  }

  get materiaSeleccionada(): MateriaPrima | undefined {
    const id = this.formMovimiento.get('materiaPrimaId')?.value;
    return this.materiasPrimas.find(mp => mp.id === id);
  }

  registrar() {
    if (this.formMovimiento.invalid) return;

    const { materiaPrimaId, tipo, cantidad } = this.formMovimiento.getRawValue();
    const stockResultante = this.materiaPrimaService.registrarMovimiento(materiaPrimaId!, tipo!, cantidad!);
    if (stockResultante === undefined) return;

    this.movimientoStockService.registrarMovimiento(materiaPrimaId!, tipo!, cantidad!, stockResultante);
    this.cerrar.emit();
  }
}
