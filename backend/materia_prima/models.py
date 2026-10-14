from django.conf import settings
from django.db import models


class MateriaPrima(models.Model):
    id_materia_prima = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    unidad_medida = models.CharField(max_length=50)
    stock_actual = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    stock_minimo = models.DecimalField(max_digits=12, decimal_places=3, default=0)

    class Meta:
        db_table = 'materia_prima'
        verbose_name = 'Materia prima'
        verbose_name_plural = 'Materias primas'

    def __str__(self):
        return self.nombre


class TipoMovimientoMateriaPrima(models.TextChoices):
    INGRESO = 'ingreso', 'Ingreso'
    CONSUMO = 'consumo', 'Consumo'
    AJUSTE = 'ajuste', 'Ajuste'


class MovimientoStockMateriaPrima(models.Model):
    id_movimiento = models.AutoField(primary_key=True)
    fecha = models.DateTimeField(auto_now_add=True)
    tipo_movimiento = models.CharField(max_length=20, choices=TipoMovimientoMateriaPrima.choices)
    cantidad = models.DecimalField(max_digits=12, decimal_places=3)
    observacion = models.TextField(blank=True)
    materia_prima = models.ForeignKey(
        MateriaPrima,
        on_delete=models.PROTECT,
        db_column='id_materia_prima',
        related_name='movimientos',
    )
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        db_column='id_usuario',
        related_name='movimientos_materia_prima',
    )

    class Meta:
        db_table = 'movimiento_stock_materia_prima'
        verbose_name = 'Movimiento de stock de materia prima'
        verbose_name_plural = 'Movimientos de stock de materia prima'
        ordering = ['-fecha']

    def __str__(self):
        return f'{self.get_tipo_movimiento_display()} de {self.cantidad} - {self.materia_prima}'
