from decimal import Decimal

from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import URLValidator
from django.db import transaction
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from materia_prima.models import MateriaPrima

from .models import Categoria, DetalleFormula, MovimientoInventarioProducto, Producto, TipoMovimientoProducto


class CategoriaSerializer(serializers.ModelSerializer):
    """Categoría de productos (API.md §7.1)."""

    class Meta:
        model = Categoria
        fields = ['id_categoria', 'nombre']


class DetalleFormulaEnProductoSerializer(serializers.ModelSerializer):
    """Una línea de la fórmula tal como viaja dentro de un producto (API.md §7.2)."""

    id_materia_prima = serializers.PrimaryKeyRelatedField(
        source='materia_prima',
        queryset=MateriaPrima.objects.all(),
        error_messages={'does_not_exist': 'No existe la materia prima con id {pk_value}.'},
    )
    nombre_materia_prima = serializers.CharField(source='materia_prima.nombre', read_only=True)

    class Meta:
        model = DetalleFormula
        fields = ['id_detalle_formula', 'id_materia_prima', 'nombre_materia_prima', 'cantidad_necesaria']

    def validate_cantidad_necesaria(self, cantidad):
        if cantidad <= 0:
            raise serializers.ValidationError('La cantidad necesaria debe ser mayor a 0.')
        return cantidad


class ProductoSerializer(serializers.ModelSerializer):
    """Producto con su fórmula anidada (API.md §7.2)."""

    id_categoria = serializers.PrimaryKeyRelatedField(
        source='categoria',
        queryset=Categoria.objects.all(),
        error_messages={'does_not_exist': 'No existe la categoría con id {pk_value}.'},
    )
    formula = DetalleFormulaEnProductoSerializer(many=True)

    class Meta:
        model = Producto
        fields = [
            'id_producto', 'codigo', 'nombre', 'descripcion', 'precio', 'estado', 'stock_actual',
            'stock_minimo', 'imagen', 'id_categoria', 'formula',
        ]
        extra_kwargs = {
            'codigo': {
                'validators': [
                    UniqueValidator(queryset=Producto.objects.all(), message='Ya existe un producto con este código.'),
                ],
            },
            'precio': {'min_value': Decimal('0')},
            'stock_actual': {'min_value': Decimal('0')},
            'stock_minimo': {'min_value': Decimal('0')},
        }

    def validate_imagen(self, imagen):
        # Se guarda solo la referencia: una ruta de assets del frontend o una URL.
        if imagen and not imagen.startswith('assets/'):
            try:
                URLValidator(schemes=['http', 'https'])(imagen)
            except DjangoValidationError:
                raise serializers.ValidationError(
                    'La imagen debe ser una ruta que empiece con "assets/" o una URL http:// o https://.'
                )
        return imagen

    def validate_formula(self, lineas):
        if not lineas:
            raise serializers.ValidationError('La fórmula debe tener al menos una materia prima.')

        ids = [linea['materia_prima'].id_materia_prima for linea in lineas]
        repetidas = sorted({id_materia_prima for id_materia_prima in ids if ids.count(id_materia_prima) > 1})
        if repetidas:
            raise serializers.ValidationError(
                [f'La materia prima con id {id_materia_prima} está repetida en la fórmula.' for id_materia_prima in repetidas]
            )
        return lineas

    def validate(self, datos):
        return datos

    @transaction.atomic
    def create(self, datos):
        # El producto, la fórmula y el stock inicial se guardan juntos.
        lineas = datos.pop('formula')
        stock_inicial = datos.pop('stock_actual', Decimal('0'))
        producto = Producto.objects.create(**datos, stock_actual=Decimal('0'))
        DetalleFormula.objects.bulk_create(DetalleFormula(producto=producto, **linea) for linea in lineas)

        if stock_inicial > 0:
            usuario = self.context['request'].user
            MovimientoInventarioProducto.objects.create(
                producto=producto,
                usuario=usuario,
                tipo_movimiento=TipoMovimientoProducto.INGRESO,
                cantidad=stock_inicial,
            )
            producto.stock_actual = stock_inicial
            producto.save(update_fields=['stock_actual'])

        return producto


class MovimientoInventarioProductoSerializer(serializers.ModelSerializer):
    """Movimiento de inventario de producto (API.md §7.4)."""

    id_producto = serializers.IntegerField(source='producto_id', read_only=True)
    id_usuario = serializers.IntegerField(source='usuario_id', read_only=True)

    class Meta:
        model = MovimientoInventarioProducto
        fields = ['id_movimiento_producto', 'fecha', 'tipo_movimiento', 'cantidad', 'id_producto', 'id_usuario']
        read_only_fields = fields
