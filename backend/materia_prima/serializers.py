from rest_framework import serializers
from django.db.models import Sum

from .models import MateriaPrima


class MateriaPrimaSerializer(serializers.ModelSerializer):
    """Materia prima del inventario (API.md §6.1)."""

    stock_reservado = serializers.SerializerMethodField()
    stock_disponible = serializers.SerializerMethodField()

    def get_stock_reservado(self, obj):
        from produccion.models import ReservaMateriaPrima

        return ReservaMateriaPrima.objects.filter(
            materia_prima=obj,
            activa=True,
        ).aggregate(total=Sum('cantidad_reservada'))['total'] or 0

    def get_stock_disponible(self, obj):
        return obj.stock_actual - self.get_stock_reservado(obj)

    class Meta:
        model = MateriaPrima
        fields = [
            'id_materia_prima',
            'nombre',
            'descripcion',
            'unidad_medida',
            'stock_actual',
            'stock_minimo',
            'stock_reservado',
            'stock_disponible',
        ]
        # El stock solo cambia registrando movimientos (§6.2).
        read_only_fields = ['stock_actual']
