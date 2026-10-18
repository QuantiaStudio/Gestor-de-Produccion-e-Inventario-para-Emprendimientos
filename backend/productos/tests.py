from unittest import mock

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import DetalleFormula, Producto

URL_PRODUCTOS = reverse('producto-list')
URL_CATEGORIAS = reverse('categoria-list')


def linea(id_materia_prima, cantidad):
    return {'id_materia_prima': id_materia_prima, 'cantidad_necesaria': cantidad}


def producto_valido(**cambios):
    """Producto del ejemplo de API.md §7.2, armado con los datos iniciales de categorías y materias primas."""
    datos = {
        'codigo': 'PT-002',
        'nombre': 'Mesa Ratona Roble',
        'descripcion': 'Mesa baja de roble con estante inferior.',
        'precio': '85000.00',
        'estado': 'activo',
        'stock_minimo': '2',
        'stock_maximo': '10',
        'imagen': 'assets/productos-terminados/mesa_ratona.webp',
        'id_categoria': 1,
        # Las materias primas van desordenadas a propósito: la respuesta tiene que respetar este orden.
        'formula': [linea(4, '0.150'), linea(1, '0.750'), linea(3, '12')],
    }
    datos.update(cambios)
    return datos


class CrearProductoTests(APITestCase):
    """POST /api/v1/productos/ (API.md §7.2)."""

    fixtures = ['categorias', 'materias_primas']

    def crear(self, datos):
        return self.client.post(URL_PRODUCTOS, datos, format='json')

    def assertErrores(self, respuesta, errores, productos_existentes=0):
        """Un 400 por datos inválidos, con exactamente estos errores por campo y sin guardar nada."""
        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(respuesta.json(), {'detail': 'Datos inválidos.', 'code': 'invalid', 'errors': errores})
        self.assertEqual(Producto.objects.count(), productos_existentes)

    def test_crea_el_producto_con_su_formula(self):
        respuesta = self.crear(producto_valido())

        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED)
        producto = Producto.objects.get()
        cuerpo = respuesta.json()
        self.assertEqual(cuerpo['id_producto'], producto.id_producto)
        self.assertEqual(cuerpo['codigo'], 'PT-002')
        self.assertEqual(cuerpo['nombre'], 'Mesa Ratona Roble')
        self.assertEqual(cuerpo['precio'], '85000.00')
        self.assertEqual(cuerpo['estado'], 'activo')
        self.assertEqual(cuerpo['stock_minimo'], '2.000')
        self.assertEqual(cuerpo['stock_maximo'], '10.000')
        self.assertEqual(cuerpo['imagen'], 'assets/productos-terminados/mesa_ratona.webp')
        self.assertEqual(cuerpo['id_categoria'], 1)
        self.assertEqual(DetalleFormula.objects.filter(producto=producto).count(), 3)

    def test_devuelve_la_formula_en_el_orden_en_que_se_envio(self):
        formula = self.crear(producto_valido()).json()['formula']

        self.assertEqual([l['id_materia_prima'] for l in formula], [4, 1, 3])
        self.assertEqual([l['cantidad_necesaria'] for l in formula], ['0.150', '0.750', '12.000'])
        self.assertTrue(all(isinstance(l['id_detalle_formula'], int) for l in formula))

    def test_el_producto_nace_con_stock_cero_aunque_se_envie_otro(self):
        respuesta = self.crear(producto_valido(stock_actual='50'))

        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED)
        self.assertEqual(respuesta.json()['stock_actual'], '0.000')
        self.assertEqual(Producto.objects.get().stock_actual, 0)

    def test_completa_los_valores_por_defecto(self):
        obligatorios = {campo: producto_valido()[campo] for campo in ('codigo', 'nombre', 'precio', 'id_categoria', 'formula')}

        cuerpo = self.crear(obligatorios).json()

        self.assertEqual(cuerpo['estado'], 'activo')
        self.assertEqual(cuerpo['descripcion'], '')
        self.assertEqual(cuerpo['stock_minimo'], '0.000')
        self.assertIsNone(cuerpo['stock_maximo'])
        self.assertEqual(cuerpo['imagen'], '')

    def test_exige_los_campos_obligatorios(self):
        requerido = ['Este campo es requerido.']
        self.assertErrores(self.crear({}), {
            'codigo': requerido,
            'nombre': requerido,
            'precio': requerido,
            'id_categoria': requerido,
            'formula': requerido,
        })

    def test_rechaza_un_codigo_repetido(self):
        self.crear(producto_valido())

        respuesta = self.crear(producto_valido(nombre='Otra mesa'))

        self.assertErrores(respuesta, {'codigo': ['Ya existe un producto con este código.']}, productos_existentes=1)

    def test_rechaza_una_categoria_inexistente(self):
        self.assertErrores(
            self.crear(producto_valido(id_categoria=99)),
            {'id_categoria': ['No existe la categoría con id 99.']},
        )

    def test_rechaza_un_precio_invalido(self):
        casos = {
            '-1': 'Asegúrese de que este valor es mayor o igual a 0.',
            '10.123': 'Asegúrese de que no haya más de 2 decimales.',
        }
        for precio, mensaje in casos.items():
            with self.subTest(precio=precio):
                self.assertErrores(self.crear(producto_valido(precio=precio)), {'precio': [mensaje]})

    def test_rechaza_un_stock_maximo_menor_que_el_minimo(self):
        self.assertErrores(
            self.crear(producto_valido(stock_minimo='10', stock_maximo='5')),
            {'stock_maximo': ['El stock máximo no puede ser menor que el stock mínimo.']},
        )

    def test_rechaza_un_estado_invalido(self):
        self.assertErrores(
            self.crear(producto_valido(estado='finalizado')),
            {'estado': ['"finalizado" no es una elección válida.']},
        )

    def test_rechaza_una_formula_vacia(self):
        self.assertErrores(
            self.crear(producto_valido(formula=[])),
            {'formula': ['La fórmula debe tener al menos una materia prima.']},
        )

    def test_rechaza_una_materia_prima_repetida(self):
        formula = [linea(1, '1'), linea(3, '2'), linea(1, '3')]
        self.assertErrores(
            self.crear(producto_valido(formula=formula)),
            {'formula': ['La materia prima con id 1 está repetida en la fórmula.']},
        )

    def test_rechaza_una_materia_prima_que_no_esta_en_el_inventario(self):
        formula = [linea(1, '1'), linea(99, '1')]
        self.assertErrores(
            self.crear(producto_valido(formula=formula)),
            {'formula': {'1': {'id_materia_prima': ['No existe la materia prima con id 99.']}}},
        )

    def test_rechaza_una_cantidad_necesaria_invalida(self):
        casos = {
            '0': 'La cantidad necesaria debe ser mayor a 0.',
            '-2': 'La cantidad necesaria debe ser mayor a 0.',
            '0.0001': 'Asegúrese de que no haya más de 3 decimales.',
        }
        for cantidad, mensaje in casos.items():
            with self.subTest(cantidad=cantidad):
                formula = [linea(1, '1'), linea(3, cantidad)]
                self.assertErrores(
                    self.crear(producto_valido(formula=formula)),
                    {'formula': {'1': {'cantidad_necesaria': [mensaje]}}},
                )

    def test_acepta_la_imagen_como_referencia(self):
        imagenes = ['assets/productos-terminados/rack_tv.jpg', 'https://res.cloudinary.com/demo/image/upload/mesa.jpg', '']
        for numero, imagen in enumerate(imagenes):
            with self.subTest(imagen=imagen):
                respuesta = self.crear(producto_valido(codigo=f'PT-IMG-{numero}', imagen=imagen))
                self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED)
                self.assertEqual(respuesta.json()['imagen'], imagen)

    def test_rechaza_una_imagen_que_no_es_referencia(self):
        mensaje = 'La imagen debe ser una ruta que empiece con "assets/" o una URL http:// o https://.'
        for imagen in ['data:image/png;base64,iVBORw0KGgo=', 'ftp://servidor/mesa.jpg']:
            with self.subTest(imagen=imagen):
                self.assertErrores(self.crear(producto_valido(imagen=imagen)), {'imagen': [mensaje]})

    def test_no_guarda_nada_si_falla_el_guardado_de_la_formula(self):
        # Falla la base después de insertar el producto y antes de guardar sus líneas.
        with mock.patch.object(DetalleFormula.objects, 'bulk_create', side_effect=RuntimeError('falla simulada')):
            respuesta = self.crear(producto_valido())

        self.assertEqual(respuesta.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertFalse(Producto.objects.exists())
        self.assertFalse(DetalleFormula.objects.exists())


class ListarCategoriasTests(APITestCase):
    """GET /api/v1/categorias/ (API.md §7.1)."""

    fixtures = ['categorias']

    def test_lista_las_categorias_ordenadas_por_nombre(self):
        respuesta = self.client.get(URL_CATEGORIAS)

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        categorias = respuesta.json()
        self.assertEqual(len(categorias), 8)
        self.assertEqual(categorias[0], {'id_categoria': 6, 'nombre': 'Banquetas'})
        nombres = [categoria['nombre'] for categoria in categorias]
        self.assertEqual(nombres, sorted(nombres))
