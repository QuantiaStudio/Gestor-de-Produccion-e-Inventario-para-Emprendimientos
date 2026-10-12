from django.core.validators import MinValueValidator
from django.db import models


class EstadoOrden(models.TextChoices):
    PENDIENTE = 'pendiente', 'Pendiente'
    EN_PRODUCCION = 'en_produccion', 'En producción'
    FINALIZADA = 'finalizada', 'Finalizada'
    CANCELADA = 'cancelada', 'Cancelada'


class OrdenProduccion(models.Model):
    # TODO: convertir a ForeignKey real cuando exista productos.Producto (TK-03-14).
    producto_id = models.PositiveIntegerField()
    # TODO: convertir a ForeignKey real cuando exista el modelo de usuarios/operador.
    operador_id = models.PositiveIntegerField()
    cantidad = models.PositiveIntegerField(
        validators=[
            MinValueValidator(1, message='La cantidad debe ser mayor a cero.'),
        ],
    )
    estado = models.CharField(
        max_length=20,
        choices=EstadoOrden.choices,
        default=EstadoOrden.PENDIENTE,
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_inicio = models.DateTimeField(null=True, blank=True)
    fecha_finalizacion = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'orden_produccion'
        verbose_name = 'Orden de producción'
        verbose_name_plural = 'Órdenes de producción'

    def __str__(self):
        return f'Orden #{self.id} ({self.estado})'
