from decimal import Decimal

from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import URLValidator
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from materia_prima.models import MateriaPrima

from .models import Categoria, DetalleFormula, Producto


class DetalleFormulaEnProductoSerializer(serializers.ModelSerializer):
    """Una línea de la fórmula tal como viaja dentro de un producto (API.md §7.2)."""

    id_materia_prima = serializers.PrimaryKeyRelatedField(
        source='materia_prima',
        queryset=MateriaPrima.objects.all(),
        error_messages={'does_not_exist': 'No existe la materia prima con id {pk_value}.'},
    )

    class Meta:
        model = DetalleFormula
        fields = ['id_detalle_formula', 'id_materia_prima', 'cantidad_necesaria']

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
            'stock_minimo', 'stock_maximo', 'imagen', 'id_categoria', 'formula',
        ]
        # El stock solo cambia con movimientos o al finalizar producción.
        read_only_fields = ['stock_actual']
        extra_kwargs = {
            'codigo': {
                'validators': [
                    UniqueValidator(queryset=Producto.objects.all(), message='Ya existe un producto con este código.'),
                ],
            },
            'precio': {'min_value': Decimal('0')},
            'stock_minimo': {'min_value': Decimal('0')},
            'stock_maximo': {'min_value': Decimal('0')},
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
        minimo = datos.get('stock_minimo', getattr(self.instance, 'stock_minimo', 0))
        maximo = datos.get('stock_maximo', getattr(self.instance, 'stock_maximo', None))
        if maximo is not None and maximo < minimo:
            raise serializers.ValidationError(
                {'stock_maximo': 'El stock máximo no puede ser menor que el stock mínimo.'}
            )
        return datos
