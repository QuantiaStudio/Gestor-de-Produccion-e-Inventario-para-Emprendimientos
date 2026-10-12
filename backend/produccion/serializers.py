from rest_framework import serializers

from .models import OrdenProduccion


class OrdenProduccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrdenProduccion
        fields = [
            'id',
            'producto_id',
            'operador_id',
            'cantidad',
            'estado',
            'fecha_creacion',
            'fecha_inicio',
            'fecha_finalizacion',
        ]
        read_only_fields = ['estado', 'fecha_creacion', 'fecha_inicio', 'fecha_finalizacion']
