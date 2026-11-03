from decimal import Decimal

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from materia_prima.models import MateriaPrima

from ...models import Categoria, DetalleFormula, Producto


PRODUCTOS_EJEMPLO = [
    {
        'codigo': 'EJ-MESA-001',
        'nombre': 'Mesa ratona de roble',
        'descripcion': 'Mesa ratona de roble macizo con estante inferior.',
        'categoria': 'Mesas',
        'precio': '185000.00',
        'stock_actual': '3.000',
        'stock_minimo': '1.000',
        'imagen': 'assets/productos-terminados/mesa_ratona.webp',
        'formula': [
            ('Roble macizo', '2.500'),
            ('Listón de pino 1 x 2 pulgadas', '4.000'),
            ('Tornillos para madera 4 x 40 mm', '16.000'),
            ('Cola vinílica para madera', '0.150'),
            ('Barniz transparente', '0.350'),
            ('Lija grano 120', '2.000'),
        ],
    },
    {
        'codigo': 'EJ-BIB-001',
        'nombre': 'Biblioteca moderna',
        'descripcion': 'Biblioteca de MDF con cinco estantes y acabado blanco.',
        'categoria': 'Bibliotecas',
        'precio': '245000.00',
        'stock_actual': '2.000',
        'stock_minimo': '1.000',
        'imagen': 'assets/productos-terminados/biblioteca_moderna.webp',
        'formula': [
            ('MDF 18 mm', '5.000'),
            ('MDF 9 mm', '1.000'),
            ('Tapacanto PVC blanco', '18.000'),
            ('Tornillos confirmat', '24.000'),
            ('Cola vinílica para madera', '0.250'),
            ('Pintura para madera', '0.400'),
            ('Lija grano 220', '2.000'),
        ],
    },
    {
        'codigo': 'EJ-COM-001',
        'nombre': 'Cómoda de seis cajones',
        'descripcion': 'Cómoda de pino con seis cajones y terminación transparente.',
        'categoria': 'Comodas',
        'precio': '320000.00',
        'stock_actual': '1.000',
        'stock_minimo': '1.000',
        'imagen': 'assets/productos-terminados/comoda_6_cajones.webp',
        'formula': [
            ('Pino macizo', '12.000'),
            ('MDF 9 mm', '2.000'),
            ('Listón de pino 2 x 2 pulgadas', '6.000'),
            ('Correderas telescópicas para cajón', '6.000'),
            ('Tiradores metálicos', '6.000'),
            ('Tornillos para madera 4 x 40 mm', '40.000'),
            ('Cola vinílica para madera', '0.500'),
            ('Barniz transparente', '0.600'),
            ('Lija grano 120', '4.000'),
        ],
    },
    {
        'codigo': 'EJ-BAN-001',
        'nombre': 'Banqueta alta de paraíso',
        'descripcion': 'Banqueta alta de madera de paraíso con asiento reforzado.',
        'categoria': 'Banquetas',
        'precio': '98000.00',
        'stock_actual': '4.000',
        'stock_minimo': '2.000',
        'imagen': 'assets/productos-terminados/banqueta_alta.jpg',
        'formula': [
            ('Paraíso macizo', '2.200'),
            ('Listón de pino 2 x 2 pulgadas', '2.500'),
            ('Tornillos para madera 4 x 40 mm', '12.000'),
            ('Cola vinílica para madera', '0.100'),
            ('Barniz transparente', '0.200'),
            ('Lija grano 220', '1.000'),
        ],
    },
]


class Command(BaseCommand):
    help = 'Crea o actualiza productos terminados de ejemplo con sus fórmulas.'

    @transaction.atomic
    def handle(self, *args, **options):
        materias_primas = {
            materia_prima.nombre: materia_prima
            for materia_prima in MateriaPrima.objects.filter(
                nombre__in={
                    nombre
                    for producto in PRODUCTOS_EJEMPLO
                    for nombre, _ in producto['formula']
                }
            )
        }
        categorias = {
            categoria.nombre: categoria
            for categoria in Categoria.objects.filter(
                nombre__in={producto['categoria'] for producto in PRODUCTOS_EJEMPLO}
            )
        }

        faltantes = [
            nombre for nombre in {
                nombre
                for producto in PRODUCTOS_EJEMPLO
                for nombre, _ in producto['formula']
            } if nombre not in materias_primas
        ]
        faltantes += [
            nombre for nombre in {
                producto['categoria'] for producto in PRODUCTOS_EJEMPLO
            } if nombre not in categorias
        ]
        if faltantes:
            raise CommandError(
                'Faltan datos iniciales requeridos: ' + ', '.join(sorted(faltantes))
            )

        for datos in PRODUCTOS_EJEMPLO:
            formula = datos['formula']
            categoria = categorias[datos['categoria']]
            producto, creado = Producto.objects.update_or_create(
                codigo=datos['codigo'],
                defaults={
                    **{campo: valor for campo, valor in datos.items()
                       if campo not in {'formula', 'categoria'}},
                    'categoria': categoria,
                },
            )
            producto.formula.all().delete()
            DetalleFormula.objects.bulk_create(
                DetalleFormula(
                    producto=producto,
                    materia_prima=materias_primas[nombre],
                    cantidad_necesaria=Decimal(cantidad),
                )
                for nombre, cantidad in formula
            )
            accion = 'Creado' if creado else 'Actualizado'
            self.stdout.write(f'{accion}: {producto.nombre}')

        self.stdout.write(self.style.SUCCESS(
            f'{len(PRODUCTOS_EJEMPLO)} productos de ejemplo cargados correctamente.'
        ))
