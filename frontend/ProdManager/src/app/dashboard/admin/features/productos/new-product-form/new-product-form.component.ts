import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-new-product-form',
  standalone: true,
  imports: [ ReactiveFormsModule ],
  templateUrl: './new-product-form.component.html',
  styleUrl: './new-product-form.component.css'
})
export class NewProductFormComponent {
  private formBuilder = inject(FormBuilder);

  materialesAgregados: any[] = [];

  productForm = this.formBuilder.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    stockInicial: [0, [Validators.required, Validators.min(0)]],
    codigo: ['', Validators.required],
    categoria: ['', Validators.required],
    nuevaCategoria: [''],


    // Campos temporales para agregar un material
    materialId: ['', Validators.required],
    cantidadMaterial: [
      null as number | null,
      [
        Validators.required,
        Validators.min(1)
      ]
    ]
  });

  get nombre() {
    return this.productForm.get('nombre');
  } 

  agregarMaterial() {

    const materialId = Number(
      this.productForm.get('materialId')?.value
    );

    const cantidad =
      this.productForm.get('cantidad')?.value;

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
      unidad: material.unidad
    });

    this.productForm.patchValue({
      materialId: '',
      cantidadMaterial: null
    });

  }

    eliminarMaterial(index: number) {

    this.materialesAgregados.splice(index, 1);

  }

  guardarProducto() {

    if (this.productForm.invalid) {

      this.productForm.markAllAsTouched();

      return;
    }

    const producto = {
      codigo: this.productForm.value.codigo,
      nombre: this.productForm.value.nombre,
      categoria: this.productForm.value.categoria,
      stockInicial: this.productForm.value.stockInicial,
      descripcion: this.productForm.value.descripcion,

      formula: this.materialesAgregados.map(material => ({
        materiaPrimaId: material.materiaPrimaId,
        cantidad: material.cantidad
      }))
    };

    console.log(producto);

  }

  materiasPrimas = [
    {
      id: 1,
      nombre: 'Tablero MDF 18 mm',
      stock: 120,
      unidad: 'unidad'
    },
    {
      id: 2,
      nombre: 'Patas de pino cepillado',
      stock: 50,
      unidad: 'unidad'
    },
    {
      id: 3,
      nombre: 'Tornillos para madera 3.5x16 mm',
      stock: 500,
      unidad: 'unidad'
    },
    {
      id: 4,
      nombre: 'Adhesivo para madera',
      stock: 20,
      unidad: 'litros'
    },
    {
      id: 5,
      nombre: 'Barniz transparente',
      stock: 15,
      unidad: 'litros'
    }
  ];
}
