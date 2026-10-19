import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { environment } from '../../../../../../environments/environment';
import type { MateriaPrimaBackendDTO } from '../../../../../models/materia-prima/materia-prima.model';
import type { CategoriaBackendDTO, ProductoTerminado } from '../../../../../models/producto/producto-terminado.model';
import { NewProductFormComponent } from './new-product-form.component';

const URL_MATERIAS_PRIMAS = `${environment.djangoApiUrl}/materias-primas/`;
const URL_CATEGORIAS = `${environment.djangoApiUrl}/categorias/`;
const URL_PRODUCTOS = `${environment.djangoApiUrl}/productos/`;

const MATERIAS_PRIMAS: MateriaPrimaBackendDTO[] = [
  { id_materia_prima: 1, nombre: 'Madera de Roble', descripcion: '', unidad_medida: 'unidad', stock_actual: '28.000', stock_minimo: '8.000' },
  { id_materia_prima: 3, nombre: 'Tornillos 3mm', descripcion: '', unidad_medida: 'u', stock_actual: '1800.000', stock_minimo: '500.000' },
];

const CATEGORIAS: CategoriaBackendDTO[] = [
  { id_categoria: 1, nombre: 'Mesas' },
  { id_categoria: 5, nombre: 'Racks' },
];

describe('NewProductFormComponent', () => {
  let component: NewProductFormComponent;
  let fixture: ComponentFixture<NewProductFormComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewProductFormComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewProductFormComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('en el alta (backend Django)', () => {
    beforeEach(() => {
      fixture.detectChanges();
      http.expectOne(URL_MATERIAS_PRIMAS).flush(MATERIAS_PRIMAS);
      http.expectOne(URL_CATEGORIAS).flush(CATEGORIAS);
      fixture.detectChanges();
    });

    function agregarMaterial(id: string, cantidad: number | null) {
      component.productForm.patchValue({ materialId: id, cantidadMaterial: cantidad });
      component.agregarMaterial();
    }

    function completarFormulario() {
      component.productForm.patchValue({
        codigo: 'PT-002',
        nombre: 'Mesa Ratona Roble',
        descripcion: 'Mesa baja de roble.',
        precio: 85000,
        categoria: '1',
        stockMinimo: 2,
        stockMaximo: 10,
        imagen: 'assets/productos-terminados/mesa_ratona.webp'
      });
    }

    function guardar() {
      component.guardarProducto();
      return http.expectOne({ method: 'POST', url: URL_PRODUCTOS });
    }

    function textoEnPantalla(): string {
      fixture.detectChanges();
      return (fixture.nativeElement as HTMLElement).textContent ?? '';
    }

    it('carga las categorías y las materias primas del backend', () => {
      expect(component.opcionesCategoria).toEqual([
        { valor: '1', etiqueta: 'Mesas' },
        { valor: '5', etiqueta: 'Racks' }
      ]);
      expect(component.materiasPrimas.map(materia => [materia.id, materia.nombre, materia.unidadMedida])).toEqual([
        ['1', 'Madera de Roble', 'unidad'],
        ['3', 'Tornillos 3mm', 'u']
      ]);
    });

    it('arranca con el estado "activo" y sin el campo de stock inicial', () => {
      expect(component.estado.value).toBe('activo');
      expect(component.stockInicial.disabled).toBeTrue();
      expect(textoEnPantalla()).not.toContain('Stock Inicial');
    });

    it('acepta cantidades con decimales y rechaza el 0', () => {
      agregarMaterial('1', 0);
      expect(component.materialesAgregados.length).toBe(0);
      expect(textoEnPantalla()).toContain('La cantidad debe ser mayor a 0 y tener hasta 3 decimales');

      agregarMaterial('1', 0.5);
      expect(component.materialesAgregados).toEqual([
        { materiaPrimaId: '1', nombre: 'Madera de Roble', cantidadMaterial: 0.5, unidad: 'unidad' }
      ]);
    });

    it('rechaza cantidades con más de 3 decimales', () => {
      agregarMaterial('1', 0.0015);
      expect(component.materialesAgregados.length).toBe(0);
      expect(component.cantidadMaterial.hasError('maximoDecimales')).toBeTrue();
    });

    it('no deja repetir una materia prima en la fórmula', () => {
      agregarMaterial('1', 1);
      agregarMaterial('1', 2);

      expect(component.materialesAgregados.length).toBe(1);
      expect(textoEnPantalla()).toContain('Esa materia prima ya está en la fórmula.');
    });

    it('no envía nada si falta la fórmula o el precio', () => {
      completarFormulario();
      component.guardarProducto();
      expect(component.materiales.hasError('required')).toBeTrue();

      agregarMaterial('1', 1);
      component.productForm.patchValue({ precio: null });
      component.guardarProducto();
      expect(component.precio.hasError('required')).toBeTrue();

      http.expectNone({ method: 'POST', url: URL_PRODUCTOS });
    });

    it('envía el producto con el formato del contrato y avisa al terminar', () => {
      const creado = spyOn(component.productoCreado, 'emit');
      completarFormulario();
      agregarMaterial('3', 12);
      agregarMaterial('1', 0.75);

      const pedido = guardar();

      expect(pedido.request.body).toEqual({
        codigo: 'PT-002',
        nombre: 'Mesa Ratona Roble',
        descripcion: 'Mesa baja de roble.',
        precio: 85000,
        estado: 'activo',
        stock_minimo: 2,
        stock_maximo: 10,
        imagen: 'assets/productos-terminados/mesa_ratona.webp',
        id_categoria: 1,
        formula: [
          { id_materia_prima: 3, cantidad_necesaria: 12 },
          { id_materia_prima: 1, cantidad_necesaria: 0.75 }
        ]
      });
      expect(component.guardando).toBeTrue();

      pedido.flush({ ...pedido.request.body, id_producto: 1, stock_actual: '0.000' }, { status: 201, statusText: 'Created' });

      expect(creado).toHaveBeenCalled();
      expect(component.guardando).toBeFalse();
    });

    it('muestra debajo del campo el error que devuelve el backend y lo borra al corregirlo', () => {
      const creado = spyOn(component.productoCreado, 'emit');
      completarFormulario();
      agregarMaterial('1', 1);

      guardar().flush(
        { detail: 'Datos inválidos.', code: 'invalid', errors: { codigo: ['Ya existe un producto con este código.'] } },
        { status: 400, statusText: 'Bad Request' }
      );

      expect(creado).not.toHaveBeenCalled();
      expect(component.mensajesDelBackend('codigo')).toEqual(['Ya existe un producto con este código.']);
      expect(textoEnPantalla()).toContain('Ya existe un producto con este código.');

      component.codigo.setValue('PT-003');
      expect(component.mensajesDelBackend('codigo')).toEqual([]);
      expect(textoEnPantalla()).not.toContain('Ya existe un producto con este código.');
    });

    it('muestra los errores de cada línea de la fórmula', () => {
      completarFormulario();
      agregarMaterial('1', 1);
      agregarMaterial('3', 2);

      guardar().flush(
        {
          detail: 'Datos inválidos.',
          code: 'invalid',
          errors: { formula: { '1': { id_materia_prima: ['No existe la materia prima con id 3.'] } } }
        },
        { status: 400, statusText: 'Bad Request' }
      );

      expect(component.erroresLineas).toEqual({ 1: ['No existe la materia prima con id 3.'] });
      expect(textoEnPantalla()).toContain('No existe la materia prima con id 3.');
    });

    it('avisa si no se puede conectar con el backend', () => {
      completarFormulario();
      agregarMaterial('1', 1);

      guardar().error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

      expect(component.errorGeneral).toBe('No se pudo conectar con el servidor. Verificá que el backend esté corriendo.');
      expect(component.guardando).toBeFalse();
    });
  });

  describe('en la edición (json-server)', () => {
    const producto: ProductoTerminado = {
      id: 'PT-001',
      apiId: 1,
      nombre: 'Mesa Nórdica',
      descripcion: '',
      imagen: '',
      categoria: 'Mesas',
      unidadMedida: 'unidad',
      stockActual: 28,
      stockMinimo: 5,
      stockMaximo: 40,
      estado: 'pendiente',
      ultimaActualizacion: '',
      formula: [],
      movimientos: []
    };

    it('carga el producto sin pedir las categorías del backend', () => {
      fixture.componentRef.setInput('productoEditar', producto);
      fixture.detectChanges();

      // El listado de materias primas ya sale de Django en todas las pantallas (TK-02-08).
      http.expectOne(URL_MATERIAS_PRIMAS).flush(MATERIAS_PRIMAS);
      http.expectNone(URL_CATEGORIAS);
      expect(component.precio.disabled).toBeTrue();
      expect(component.codigo.value).toBe('PT-001');
    });
  });
});
