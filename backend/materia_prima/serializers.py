from rest_framework import serializers

from .models import MateriaPrima


class MateriaPrimaSerializer(serializers.ModelSerializer):
    class Meta:
        model = MateriaPrima
        fields = [
            'id_materia_prima',
            'nombre',
            'descripcion',
            'unidad_medida',
            'stock_actual',
            'stock_minimo',
        ]
