from django.db import models


class Estado(models.Model):
    id_estado = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=50, unique=True)

    class Meta:
        db_table = 'estado'
        verbose_name = 'Estado'
        verbose_name_plural = 'Estados'

    def __str__(self):
        return self.nombre


class OrdenProduccion(models.Model):
    id_orden = models.AutoField(primary_key=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_inicio = models.DateTimeField(null=True, blank=True)
    estado = models.ForeignKey(
        Estado,
        on_delete=models.PROTECT,
        db_column='id_estado',
        related_name='ordenes',
    )

    class Meta:
        db_table = 'orden_produccion'
        verbose_name = 'Orden de producción'
        verbose_name_plural = 'Órdenes de producción'
        ordering = ['-fecha_creacion']

    def __str__(self):
        return f'Orden #{self.id_orden} ({self.estado})'


class DetalleOrdenProduccion(models.Model):
    id_detalle_produccion = models.AutoField(primary_key=True)
    orden = models.ForeignKey(
        OrdenProduccion,
        on_delete=models.CASCADE,
        db_column='id_orden',
        related_name='detalles',
    )
    producto = models.ForeignKey(
        'productos.Producto',
        on_delete=models.PROTECT,
        db_column='id_producto',
        related_name='detalles_produccion',
    )
    cantidad_planificada = models.DecimalField(max_digits=12, decimal_places=3)
    cantidad_producida = models.DecimalField(max_digits=12, decimal_places=3, default=0)

    class Meta:
        db_table = 'detalle_orden_produccion'
        verbose_name = 'Detalle de orden de producción'
        verbose_name_plural = 'Detalles de orden de producción'

    def __str__(self):
        return f'{self.producto} x {self.cantidad_planificada} (orden #{self.orden_id})'
