from django.db import models
from django.core.validators import MinValueValidator

class MateriaPrima(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    unidad_medida = models.CharField(max_length=50)
    stock_actual = models.DecimalField(max_digits=10, decimal_places=2)
    stock_minimo = models.DecimalField(
        max_digits=10,
        decimal_places=0,
        validators=[
            MinValueValidator(
                0,
                message='El stock mínimo debe ser un número entero no negativo.',
            ),
        ],
    )

    class Meta:
        db_table = 'materia_prima'
        verbose_name = 'Materia prima'
        verbose_name_plural = 'Materias primas'

    def __str__(self):
        return self.nombre
