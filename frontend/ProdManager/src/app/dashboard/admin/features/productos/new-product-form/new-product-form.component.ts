import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { MateriaPrima } from '../../../../../models/materia-prima/materia-prima.model';
import type { EstadoProductoTerminado, MaterialAgregadoProducto, ProductoTerminado } from '../../../../../models/producto/producto-terminado.model';
import { MateriaPrimaService } from '../../../../../services/materia-prima.service';
import { ProductoTerminadoService } from '../../../../../services/producto-terminado.service';

@Component({
  selector: 'app-new-product-form',
  standalone: true,
  imports: [ ReactiveFormsModule ],
  templateUrl: './new-product-form.component.html',
  styleUrl: './new-product-form.component.css'
})
export class NewProductFormComponent implements OnChanges, OnInit {
  @Input() categorias: string[] = [];
  @Input() estados: EstadoProductoTerminado[] = [];
  @Input() productoEditar: ProductoTerminado | null = null;
  @Output() cerrar = new EventEmitter<void>();
  @Output() productoCreado = new EventEmitter<void>();
  @Output() productoActualizado = new EventEmitter<void>();

  private materiaPrimaService = inject(MateriaPrimaService);
  private productoTerminadoService = inject(ProductoTerminadoService);
  private formBuilder = inject(FormBuilder);

  materiasPrimas: MateriaPrima[] = [];
  materialesAgregados: MaterialAgregadoProducto[] = [];
  imagenSeleccionada: string | null = null;

  ngOnInit() {
    this.materiaPrimaService.obtenerMateriasPrimas$().subscribe({
      next: materiasPrimas => {
        this.materiasPrimas = materiasPrimas;
        if (this.productoEditar) {
          this.cargarProductoEnFormulario(this.productoEditar);
        }
      },
      error: error => console.error('Error al cargar materias primas', error)
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['productoEditar']?.currentValue) {
      this.cargarProductoEnFormulario(changes['productoEditar'].currentValue);
    }
  }

  productForm = this.formBuilder.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    stockInicial: [0, [Validators.required, Validators.min(1)]],
    stockMinimo: [1, [Validators.required, Validators.min(0)]],
    stockMaximo: [1, [Validators.required, Validators.min(0)]],
    codigo: ['', Validators.required],
    categoria: ['', Validators.required],
    estado: ['', Validators.required],
    nuevaCategoria: [''],
    materiales: this.formBuilder.nonNullable.control<any[]>([], Validators.required),


    // Campos temporales para agregar un material
    materialId: [''],
    cantidadMaterial: [
      null as number | null,
      [
        Validators.min(1)
      ]
    ]
  });

  get nombre() {
    return this.productForm.get('nombre')!;
  } 
  get categoria() {
    return this.productForm.get('categoria')!;
  }
  get stockInicial() {
    return this.productForm.get('stockInicial')!;
  }
  get stockMinimo() {
    return this.productForm.get('stockMinimo')!;
  }
  get stockMaximo() {
    return this.productForm.get('stockMaximo')!;
  }
  get codigo() {
    return this.productForm.get('codigo')!;
  }
  get estado() {
    return this.productForm.get('estado')!;
  }
  get materialId() {
    return this.productForm.get('materialId')!;
  }
  get cantidadMaterial() {
    return this.productForm.get('cantidadMaterial')!;
  }

  seleccionarImagen(event: Event) {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = () => this.imagenSeleccionada = String(lector.result);
    lector.readAsDataURL(archivo);
  }
  /*Falta  implementar la validación de nueva categoría. TERMINAR FEATURE AL INTEGRAR MÓDULO DE PRODUCTOS*/
  get nuevaCategoria() {
    return this.productForm.get('nuevaCategoria')!;
  }
  get materiales() {
    return this.productForm.get('materiales')!;
  }
 
  get materialesInvalidos() {
    return this.materiales?.hasError('required') && this.materiales?.touched;
  }

  get stockRangoInvalido() {
    const minimo = Number(this.stockMinimo?.value);
    const maximo = Number(this.stockMaximo?.value);
    return this.stockMinimo?.touched && this.stockMaximo?.touched && minimo > maximo;
  }

  agregarMaterial() {

    const materialId = this.productForm.get('materialId')?.value;

    const cantidad = Number(
      this.productForm.get('cantidadMaterial')?.value
    );

    if (!materialId || !cantidad) {
      return;
    }

    const material = this.materiasPrimas.find(
      m => m.id === materialId
    );

    if (!material) {
      return;
    }

    this.materialesAgregados.push({
      materiaPrimaId: material.id,
      nombre: material.nombre,
      cantidadMaterial: cantidad,
      unidad: material.unidadMedida
    });

    this.actualizarMaterialesControl();

    this.productForm.patchValue({
      materialId: '',
      cantidadMaterial: null
    });

  }

  eliminarMaterial(index: number) {

    this.materialesAgregados.splice(index, 1);
    this.actualizarMaterialesControl();

  }

  guardarProducto() {
    const minimo = Number(this.stockMinimo?.value);
    const maximo = Number(this.stockMaximo?.value);
    const rangoStockInvalido = minimo > maximo;

    if (this.productForm.invalid || rangoStockInvalido) {

      this.productForm.markAllAsTouched();

      return;
    }

    const valoresFormulario = {
      ...this.productForm.getRawValue(),
      estado: this.estado.value as EstadoProductoTerminado,
      imagen: this.imagenSeleccionada
    };

    const guardado = this.productoEditar
      ? this.productoTerminadoService.actualizarProducto(this.productoEditar, valoresFormulario, this.materialesAgregados)
      : this.productoTerminadoService.crearProducto(valoresFormulario, this.materialesAgregados);

    guardado.subscribe({
      next: () => {
        this.limpiarFormulario();
        if (this.productoEditar) {
          this.productoActualizado.emit();
        } else {
          this.productoCreado.emit();
        }
      },
      error: error => {
        console.error('Error al registrar el producto', error);
      }
    });

  }

  cancelar() {
    this.limpiarFormulario();
    this.cerrar.emit();
  }

  private limpiarFormulario() {
    this.materialesAgregados = [];
    this.imagenSeleccionada = null;
    this.productForm.reset({
      nombre: '',
      descripcion: '',
      stockInicial: 0,
      stockMinimo: 1,
      stockMaximo: 1,
      codigo: '',
      categoria: '',
      estado: '',
      nuevaCategoria: '',
      materiales: [],
      materialId: '',
      cantidadMaterial: null
    });
  }

  private cargarProductoEnFormulario(producto: ProductoTerminado) {
    this.productForm.patchValue({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      stockInicial: producto.stockActual,
      stockMinimo: producto.stockMinimo,
      stockMaximo: producto.stockMaximo,
      codigo: producto.id,
      categoria: producto.categoria,
      estado: producto.estado,
      nuevaCategoria: ''
    });
    this.imagenSeleccionada = producto.imagen || null;

    this.materialesAgregados = producto.formula.map(material => {
      const materiaPrima = this.materiasPrimas.find(item => item.id === material.materiaPrimaId);
      return {
        materiaPrimaId: material.materiaPrimaId,
        nombre: material.nombreMateriaPrima,
        cantidadMaterial: material.cantidad,
        unidad: materiaPrima?.unidadMedida ?? 'unidad'
      };
    });
    this.actualizarMaterialesControl();
  }

  private actualizarMaterialesControl() {
    this.materiales?.setValue([...this.materialesAgregados]);
    this.materiales?.markAsTouched();
    this.materiales?.updateValueAndValidity();
  }

}
