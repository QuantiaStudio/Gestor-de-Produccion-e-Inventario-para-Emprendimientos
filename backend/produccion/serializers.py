from rest_framework import serializers

from productos.models import Producto

from .models import DetalleOrdenProduccion, Estado, OrdenProduccion


class EstadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estado
        fields = ['id_estado', 'nombre']


class OrdenProduccionSerializer(serializers.ModelSerializer):
    """API.md §8.2: id_estado por defecto es 1 (Pendiente) si no se envía."""

    id_estado = serializers.PrimaryKeyRelatedField(
        source='estado',
        queryset=Estado.objects.all(),
        required=False,
    )

    class Meta:
        model = OrdenProduccion
        fields = ['id_orden', 'fecha_creacion', 'fecha_inicio', 'id_estado']
        read_only_fields = ['id_orden', 'fecha_creacion']

    def create(self, validated_data):
        validated_data.setdefault('estado', Estado.objects.get(pk=1))
        return super().create(validated_data)


class DetalleOrdenProduccionSerializer(serializers.ModelSerializer):
    """API.md §8.3."""

    id_orden = serializers.PrimaryKeyRelatedField(source='orden', queryset=OrdenProduccion.objects.all())
    id_producto = serializers.PrimaryKeyRelatedField(source='producto', queryset=Producto.objects.all())

    class Meta:
        model = DetalleOrdenProduccion
        fields = ['id_detalle_produccion', 'id_orden', 'id_producto', 'cantidad_planificada', 'cantidad_producida']
        read_only_fields = ['id_detalle_produccion']
        extra_kwargs = {'cantidad_producida': {'required': False}}
