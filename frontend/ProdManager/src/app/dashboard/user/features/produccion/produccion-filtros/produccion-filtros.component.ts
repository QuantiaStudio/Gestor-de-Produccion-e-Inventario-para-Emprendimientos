import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  EstadoOrdenProduccion,
  FiltroOrdenProduccion,
  ProductoOrdenProduccion
} from '../../../../../models/orden-produccion/orden-produccion.model';

type FormularioFiltros = {
  busqueda: FormControl<string>;
  estado: FormControl<EstadoOrdenProduccion | ''>;
  productoId: FormControl<string>;
};

@Component({
  selector: 'app-produccion-filtros',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './produccion-filtros.component.html',
  styleUrl: './produccion-filtros.component.css'
})
export class ProduccionFiltrosComponent implements OnInit, OnDestroy {
  @Input({ required: true }) productos!: ProductoOrdenProduccion[];
  @Output() filtrosCambiaron = new EventEmitter<FiltroOrdenProduccion>();

  formulario: FormGroup<FormularioFiltros>;
  private cambios?: Subscription;

  constructor(private formBuilder: FormBuilder) {
    this.formulario = this.formBuilder.nonNullable.group({
      busqueda: '',
      estado: '' as EstadoOrdenProduccion | '',
      productoId: ''
    });
  }

  ngOnInit(): void {
    this.cambios = this.formulario.valueChanges.subscribe(() =>
      this.emitirFiltros()
    );
  }

  ngOnDestroy(): void {
    this.cambios?.unsubscribe();
  }

  limpiar(): void {
    this.formulario.reset();
  }

  private emitirFiltros(): void {
    const { busqueda, estado, productoId } = this.formulario.getRawValue();

    this.filtrosCambiaron.emit({
      busqueda,
      estado: estado === '' ? undefined : estado,
      productoId: productoId === '' ? undefined : productoId
    });
  }
}
