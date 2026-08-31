import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { EstadoProductoTerminado, FiltroProductoTerminado } from '../../models/producto/producto-terminado.model';

type FormularioFiltros = {
  busqueda: FormControl<string>;
  categoria: FormControl<string>;
  estado: FormControl<EstadoProductoTerminado | ''>;
};

@Component({
  selector: 'app-producto-terminado-filtros',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './producto-terminado-filtros.component.html',
  styleUrl: './producto-terminado-filtros.component.css'
})
export class ProductoTerminadoFiltrosComponent implements OnInit, OnDestroy {
  @Input({ required: true }) categorias!: string[];
  @Output() filtrosCambiaron = new EventEmitter<FiltroProductoTerminado>();

  formulario: FormGroup<FormularioFiltros>;
  private cambios?: Subscription;

  constructor(private fb: FormBuilder) {
    this.formulario = this.fb.nonNullable.group({
      busqueda: '',
      categoria: '',
      estado: '' as EstadoProductoTerminado | ''
    });
  }

  ngOnInit() {
    this.cambios = this.formulario.valueChanges.subscribe(() => this.emitirFiltros());
  }

  ngOnDestroy() {
    this.cambios?.unsubscribe();
  }

  limpiar() {
    this.formulario.reset();
  }

  private emitirFiltros() {
    const { busqueda, categoria, estado } = this.formulario.getRawValue();
    this.filtrosCambiaron.emit({
      busqueda,
      categoria,
      estado: estado === '' ? undefined : estado
    });
  }
}
