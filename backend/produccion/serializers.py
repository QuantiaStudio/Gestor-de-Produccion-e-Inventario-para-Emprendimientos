from decimal import Decimal

from django.db import transaction
from rest_framework import serializers

from productos.models import Producto

from .models import DetalleOrdenProduccion, Estado, OrdenProduccion


class EstadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estado
        fields = ['id_estado', 'nombre']


class DetalleInicialOrdenSerializer(serializers.Serializer):
    id_producto = serializers.PrimaryKeyRelatedField(source='producto', queryset=Producto.objects.all())
    cantidad_planificada = serializers.DecimalField(
        max_digits=12,
        decimal_places=3,
        min_value=Decimal('0.001'),
    )


class OrdenProduccionSerializer(serializers.ModelSerializer):
    """La orden inicial y su primer detalle se guardan en una sola transacción."""

    id_estado = serializers.PrimaryKeyRelatedField(
        source='estado',
        queryset=Estado.objects.all(),
        required=False,
    )
    detalle = DetalleInicialOrdenSerializer(write_only=True)
    id_usuario = serializers.IntegerField(source='operador_id', read_only=True, allow_null=True)

    class Meta:
        model = OrdenProduccion
        fields = [
            'id_orden', 'fecha_creacion', 'fecha_inicio', 'id_estado',
            'id_usuario', 'observaciones', 'detalle',
        ]
        read_only_fields = ['id_orden', 'fecha_creacion']

    @transaction.atomic
    def create(self, validated_data):
        detalle = validated_data.pop('detalle')
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['operador'] = request.user
        validated_data.setdefault('estado', Estado.objects.get(pk=1))
        orden = super().create(validated_data)
        DetalleOrdenProduccion.objects.create(orden=orden, **detalle)
        return orden


class DetalleOrdenProduccionSerializer(serializers.ModelSerializer):
    """API.md §8.3."""

    id_orden = serializers.PrimaryKeyRelatedField(source='orden', queryset=OrdenProduccion.objects.all())
    id_producto = serializers.PrimaryKeyRelatedField(source='producto', queryset=Producto.objects.all())

    class Meta:
        model = DetalleOrdenProduccion
        fields = ['id_detalle_produccion', 'id_orden', 'id_producto', 'cantidad_planificada', 'cantidad_producida']
        read_only_fields = ['id_detalle_produccion']
        extra_kwargs = {'cantidad_producida': {'required': False}}
