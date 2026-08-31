import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { MateriaPrima } from '../../../../../models/materia-prima/materia-prima.model';
import type { MaterialAgregadoProducto } from '../../../../../models/producto/producto-terminado.model';
import { MateriaPrimaService } from '../../../../../services/materia-prima.service';
import { ProductoTerminadoService } from '../../../../../services/producto-terminado.service';

@Component({
  selector: 'app-new-product-form',
  standalone: true,
  imports: [ ReactiveFormsModule ],
  templateUrl: './new-product-form.component.html',
  styleUrl: './new-product-form.component.css'
})
export class NewProductFormComponent {
  private materiaPrimaService = inject(MateriaPrimaService);
  private productoTerminadoService = inject(ProductoTerminadoService);
  private formBuilder = inject(FormBuilder);

  materiasPrimas: MateriaPrima[] = this.materiaPrimaService.obtenerMateriasPrimas();
  materialesAgregados: MaterialAgregadoProducto[] = [];

  productForm = this.formBuilder.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    stockInicial: [0, [Validators.required, Validators.min(1)]],
    codigo: ['', Validators.required],
    categoria: ['', Validators.required],
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
    return this.productForm.get('nombre');
  } 
  get categoria() {
    return this.productForm.get('categoria');
  }
  get stockInicial() {
    return this.productForm.get('stockInicial');
  }
  get codigo() {
    return this.productForm.get('codigo');
  }
  get materialId() {
    return this.productForm.get('materialId');
  }
  get cantidadMaterial() {
    return this.productForm.get('cantidadMaterial');
  }
  /*Falta  implementar la validación de nueva categoría. TERMINAR FEATURE AL INTEGRAR MÓDULO DE PRODUCTOS*/
  get nuevaCategoria() {
    return this.productForm.get('nuevaCategoria');
  }
  get materiales() {
    return this.productForm.get('materiales');
  }
 
  get materialesInvalidos() {
    return this.materiales?.hasError('required') && this.materiales?.touched;
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

    if (this.productForm.invalid) {

      this.productForm.markAllAsTouched();

      return;
    }

    this.productoTerminadoService.crearProducto(
      this.productForm.getRawValue(),
      this.materialesAgregados
    );

    this.materialesAgregados = [];
    this.productForm.reset({
      nombre: '',
      descripcion: '',
      stockInicial: 0,
      codigo: '',
      categoria: '',
      nuevaCategoria: '',
      materiales: [],
      materialId: '',
      cantidadMaterial: null
    });

  }

  private actualizarMaterialesControl() {
    this.materiales?.setValue([...this.materialesAgregados]);
    this.materiales?.markAsTouched();
    this.materiales?.updateValueAndValidity();
  }

}
