from rest_framework import serializers

from .models import MateriaPrima


class MateriaPrimaSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='id_materia_prima', read_only=True)

    class Meta:
        model = MateriaPrima
        fields = [
            'id',
            'nombre',
            'descripcion',
            'unidad_medida',
            'stock_actual',
            'stock_minimo',
        ]
        read_only_fields = ['stock_actual']
