import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActualizacionStock, ProductoTerminado } from '../../../../../models/producto/producto-terminado.model';

type FormularioStock = {
  id: FormControl<string>;
  stockActual: FormControl<number>;
  stockMinimo: FormControl<number>;
};

@Component({
  selector: 'app-producto-terminado-actualizar-stock',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './producto-terminado-actualizar-stock.component.html',
  styleUrl: './producto-terminado-actualizar-stock.component.css'
})
export class ProductoTerminadoActualizarStockComponent {
  @Input({ required: true }) productos!: ProductoTerminado[];
  @Output() actualizar = new EventEmitter<ActualizacionStock>();

  abierto = false;
  formulario: FormGroup<FormularioStock>;

  constructor(private fb: FormBuilder) {
    this.formulario = this.fb.nonNullable.group({
      id: ['', Validators.required],
      stockActual: [0, [Validators.required, Validators.min(0)]],
      stockMinimo: [0, [Validators.required, Validators.min(0)]]
    });
  }

  abrir() {
    this.formulario.reset();
    this.abierto = true;
  }

  cerrar() {
    this.abierto = false;
  }

  seleccionarProducto(id: string) {
    const producto = this.productos.find(pt => pt.id === id);
    if (!producto) return;

    this.formulario.patchValue({
      stockActual: producto.stockActual,
      stockMinimo: producto.stockMinimo
    });
  }

  guardar() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.actualizar.emit(this.formulario.getRawValue());
    this.cerrar();
  }
}
