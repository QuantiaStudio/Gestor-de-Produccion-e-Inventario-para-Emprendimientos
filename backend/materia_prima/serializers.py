from rest_framework import serializers

from .models import MateriaPrima


class MateriaPrimaSerializer(serializers.ModelSerializer):
    """Materia prima del inventario (API.md §6.1)."""

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
        # El stock solo cambia registrando movimientos (§6.2).
        read_only_fields = ['stock_actual']
