import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import type { ErrorBackendDTO, ErroresDeCampo } from '../../../../../models/error-backend/error-backend.model';
import type { MateriaPrima } from '../../../../../models/materia-prima/materia-prima.model';
import type { CategoriaBackendDTO, EstadoProductoBackend, EstadoProductoTerminado, MaterialAgregadoProducto, ProductoBackendDTO, ProductoTerminado } from '../../../../../models/producto/producto-terminado.model';
import { MateriaPrimaService } from '../../../../../services/materia-prima.service';
import { ProductoTerminadoService } from '../../../../../services/producto-terminado.service';

interface OpcionSelect {
  valor: string;
  etiqueta: string;
}

/** Estados con los que se puede dar de alta un producto en el backend (backend/API.md §7.2). */
const ESTADOS_PRODUCTO: OpcionSelect[] = [
  { valor: 'activo', etiqueta: 'Activo' },
  { valor: 'inactivo', etiqueta: 'Inactivo' },
  { valor: 'en_produccion', etiqueta: 'En producción' },
  { valor: 'pendiente', etiqueta: 'Pendiente' },
];

/**
 * Imágenes que se pueden asignar a un producto nuevo. El backend guarda solo la referencia
 * (backend/API.md §7.2): para sumar una, agregar el archivo en src/assets/productos-terminados/ y listarlo acá.
 */
const IMAGENES_PRODUCTO: OpcionSelect[] = [
  { valor: 'assets/productos-terminados/banqueta_alta.jpg', etiqueta: 'Banqueta alta' },
  { valor: 'assets/productos-terminados/biblioteca_moderna.webp', etiqueta: 'Biblioteca moderna' },
  { valor: 'assets/productos-terminados/comoda_6_cajones.webp', etiqueta: 'Cómoda de 6 cajones' },
  { valor: 'assets/productos-terminados/escritorio_gamer.jpg', etiqueta: 'Escritorio gamer' },
  { valor: 'assets/productos-terminados/mesa_nordica.jpg', etiqueta: 'Mesa nórdica' },
  { valor: 'assets/productos-terminados/mesa_ratona.webp', etiqueta: 'Mesa ratona' },
  { valor: 'assets/productos-terminados/rack_tv.jpg', etiqueta: 'Rack TV' },
];

/** Control del formulario que corresponde a cada campo del backend, para mostrar sus errores. */
const CONTROL_POR_CAMPO_BACKEND: Partial<Record<string, string>> = {
  codigo: 'codigo',
  nombre: 'nombre',
  descripcion: 'descripcion',
  precio: 'precio',
  estado: 'estado',
  stock_minimo: 'stockMinimo',
  stock_maximo: 'stockMaximo',
  imagen: 'imagen',
  id_categoria: 'categoria',
};

/** El backend rechaza números con más decimales de los que guarda la base. */
function maximoDecimales(cantidad: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null || control.value === '') return null;
    const decimales = String(control.value).split('.')[1]?.length ?? 0;
    return decimales > cantidad ? { maximoDecimales: cantidad } : null;
  };
}

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

  readonly imagenesDisponibles = IMAGENES_PRODUCTO;

  materiasPrimas: MateriaPrima[] = [];
  categoriasBackend: CategoriaBackendDTO[] = [];
  materialesAgregados: MaterialAgregadoProducto[] = [];
  imagenSeleccionada: string | null = null;
  errorMaterial: string | null = null;
  erroresLineas: Record<number, string[]> = {};
  errorGeneral: string | null = null;
  guardando = false;

  /** El alta de productos usa el backend Django; la edición todavía usa json-server. */
  get modoEdicion(): boolean {
    return this.productoEditar !== null;
  }

  ngOnInit() {
    if (this.modoEdicion) {
      this.precio.disable();
      this.imagen.disable();
      this.cargarDatosDeJsonServer();
    } else {
      this.stockInicial.disable();
      this.estado.setValue('activo');
      this.cargarDatosDelBackend();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['productoEditar']?.currentValue) {
      this.cargarProductoEnFormulario(changes['productoEditar'].currentValue);
    }
  }

  productForm = this.formBuilder.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    descripcion: [''],
    precio: [null as number | null, [Validators.required, Validators.min(0), maximoDecimales(2)]],
    stockInicial: [0, [Validators.required, Validators.min(1)]],
    stockMinimo: [1, [Validators.required, Validators.min(0)]],
    stockMaximo: [1, [Validators.required, Validators.min(0)]],
    codigo: ['', [Validators.required, Validators.maxLength(20)]],
    categoria: ['', Validators.required],
    estado: ['', Validators.required],
    nuevaCategoria: [''],
    // Referencia a una imagen de assets (solo en el alta).
    imagen: [''],
    materiales: this.formBuilder.nonNullable.control<any[]>([], Validators.required),


    // Campos temporales para agregar un material
    materialId: [''],
    cantidadMaterial: [
      null as number | null,
      [
        Validators.min(0.001),
        maximoDecimales(3)
      ]
    ]
  });

  get nombre() {
    return this.productForm.get('nombre')!;
  }
  get categoria() {
    return this.productForm.get('categoria')!;
  }
  get precio() {
    return this.productForm.get('precio')!;
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
  get imagen() {
    return this.productForm.get('imagen')!;
  }
  get materialId() {
    return this.productForm.get('materialId')!;
  }
  get cantidadMaterial() {
    return this.productForm.get('cantidadMaterial')!;
  }

  get opcionesEstado(): OpcionSelect[] {
    return this.modoEdicion
      ? this.estados.map(estado => ({ valor: estado, etiqueta: estado }))
      : ESTADOS_PRODUCTO;
  }

  get opcionesCategoria(): OpcionSelect[] {
    return this.modoEdicion
      ? this.categorias.map(categoria => ({ valor: categoria, etiqueta: categoria }))
      : this.categoriasBackend.map(categoria => ({ valor: String(categoria.id_categoria), etiqueta: categoria.nombre }));
  }

  /** Mensajes que devolvió el backend para un control. Se borran solos cuando se edita el campo. */
  mensajesDelBackend(nombreControl: string): string[] {
    return this.productForm.get(nombreControl)?.getError('backend') ?? [];
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
    this.errorMaterial = null;

    const materialId = this.materialId.value;
    const cantidad = this.cantidadMaterial.value;

    if (!materialId || cantidad === null) {
      this.errorMaterial = 'Seleccioná una materia prima e ingresá la cantidad.';
      return;
    }

    if (this.cantidadMaterial.invalid) {
      this.cantidadMaterial.markAsTouched();
      return;
    }

    if (this.materialesAgregados.some(m => m.materiaPrimaId === materialId)) {
      this.errorMaterial = 'Esa materia prima ya está en la fórmula.';
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
      cantidadMaterial: Number(cantidad),
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
    this.errorGeneral = null;

    const minimo = Number(this.stockMinimo?.value);
    const maximo = Number(this.stockMaximo?.value);
    const rangoStockInvalido = minimo > maximo;

    if (this.productForm.invalid || rangoStockInvalido) {

      this.productForm.markAllAsTouched();

      return;
    }

    if (this.productoEditar) {
      this.actualizarEnJsonServer(this.productoEditar);
    } else {
      this.crearEnBackend();
    }

  }

  cancelar() {
    this.limpiarFormulario();
    this.cerrar.emit();
  }

  private cargarDatosDeJsonServer() {
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

  private cargarDatosDelBackend() {
    forkJoin({
      materiasPrimas: this.materiaPrimaService.obtenerMateriasPrimasDelBackend$(),
      categorias: this.productoTerminadoService.obtenerCategoriasDelBackend()
    }).subscribe({
      next: ({ materiasPrimas, categorias }) => {
        this.materiasPrimas = materiasPrimas;
        this.categoriasBackend = categorias;
      },
      error: (error: HttpErrorResponse) => this.mostrarErroresDelBackend(error)
    });
  }

  private crearEnBackend() {
    const valores = this.productForm.getRawValue();
    const producto: ProductoBackendDTO = {
      codigo: valores.codigo ?? '',
      nombre: valores.nombre ?? '',
      descripcion: valores.descripcion ?? '',
      precio: valores.precio ?? 0,
      estado: valores.estado as EstadoProductoBackend,
      stock_minimo: valores.stockMinimo ?? 0,
      stock_maximo: valores.stockMaximo ?? null,
      imagen: valores.imagen ?? '',
      id_categoria: Number(valores.categoria),
      formula: this.materialesAgregados.map(material => ({
        id_materia_prima: Number(material.materiaPrimaId),
        cantidad_necesaria: material.cantidadMaterial
      }))
    };

    this.erroresLineas = {};
    this.guardando = true;

    this.productoTerminadoService.crearProducto(producto)
      .pipe(finalize(() => this.guardando = false))
      .subscribe({
        next: () => {
          this.limpiarFormulario();
          this.productoCreado.emit();
        },
        error: (error: HttpErrorResponse) => this.mostrarErroresDelBackend(error)
      });
  }

  private actualizarEnJsonServer(productoEditar: ProductoTerminado) {
    const valoresFormulario = {
      ...this.productForm.getRawValue(),
      estado: this.estado.value as EstadoProductoTerminado,
      imagen: this.imagenSeleccionada
    };

    this.productoTerminadoService.actualizarProducto(productoEditar, valoresFormulario, this.materialesAgregados).subscribe({
      next: () => {
        this.limpiarFormulario();
        this.productoActualizado.emit();
      },
      error: error => {
        console.error('Error al registrar el producto', error);
      }
    });
  }

  /** Muestra los errores del backend: los de cada campo debajo del campo y el resto arriba de los botones. */
  private mostrarErroresDelBackend(error: HttpErrorResponse) {
    if (error.status === 0) {
      this.errorGeneral = 'No se pudo conectar con el servidor. Verificá que el backend esté corriendo.';
      return;
    }

    const cuerpo = error.error as ErrorBackendDTO | null;
    if (error.status !== 400 || !cuerpo?.errors) {
      this.errorGeneral = cuerpo?.detail ?? 'Ocurrió un error inesperado. Intentá de nuevo.';
      return;
    }

    const otrosMensajes: string[] = [];
    for (const [campo, errores] of Object.entries(cuerpo.errors)) {
      const nombreControl = CONTROL_POR_CAMPO_BACKEND[campo];
      const control = nombreControl ? this.productForm.get(nombreControl) : null;

      if (campo === 'formula') {
        this.mostrarErroresDeFormula(errores);
      } else if (control && Array.isArray(errores)) {
        control.setErrors({ backend: errores });
        control.markAsTouched();
      } else {
        otrosMensajes.push(...this.aplanarErrores(errores));
      }
    }

    if (otrosMensajes.length > 0) {
      this.errorGeneral = otrosMensajes.join(' ');
    }
  }

  private mostrarErroresDeFormula(errores: ErroresDeCampo) {
    if (Array.isArray(errores)) {
      this.materiales.setErrors({ backend: errores });
      this.materiales.markAsTouched();
      return;
    }

    // Errores de líneas puntuales, indexados por su posición: { "1": { "cantidad_necesaria": [...] } }
    this.erroresLineas = {};
    for (const [indice, erroresDeLinea] of Object.entries(errores)) {
      this.erroresLineas[Number(indice)] = Object.values(erroresDeLinea).flat();
    }
  }

  private aplanarErrores(errores: ErroresDeCampo): string[] {
    return Array.isArray(errores)
      ? errores
      : Object.values(errores).flatMap(erroresDeLinea => Object.values(erroresDeLinea).flat());
  }

  private limpiarFormulario() {
    this.materialesAgregados = [];
    this.imagenSeleccionada = null;
    this.errorMaterial = null;
    this.erroresLineas = {};
    this.productForm.reset({
      nombre: '',
      descripcion: '',
      precio: null,
      stockInicial: 0,
      stockMinimo: 1,
      stockMaximo: 1,
      codigo: '',
      categoria: '',
      estado: this.modoEdicion ? '' : 'activo',
      nuevaCategoria: '',
      imagen: '',
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
    // Las posiciones de las líneas cambian: los errores por línea del backend ya no aplican.
    this.erroresLineas = {};
    this.materiales?.setValue([...this.materialesAgregados]);
    this.materiales?.markAsTouched();
    this.materiales?.updateValueAndValidity();
  }

}
