from django.conf import settings
from django.db import models


class Categoria(models.Model):
    id_categoria = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = 'categoria'
        verbose_name = 'Categoría'
        verbose_name_plural = 'Categorías'

    def __str__(self):
        return self.nombre


class EstadoProducto(models.TextChoices):
    ACTIVO = 'activo', 'Activo'
    INACTIVO = 'inactivo', 'Inactivo'
    EN_PRODUCCION = 'en_produccion', 'En producción'
    PENDIENTE = 'pendiente', 'Pendiente'


class Producto(models.Model):
    id_producto = models.AutoField(primary_key=True)
    codigo = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    precio = models.DecimalField(max_digits=12, decimal_places=2)
    estado = models.CharField(max_length=20, choices=EstadoProducto.choices, default=EstadoProducto.ACTIVO)
    stock_actual = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    stock_minimo = models.DecimalField(max_digits=12, decimal_places=3, default=0)
    # null = sin tope de stock.
    stock_maximo = models.DecimalField(max_digits=12, decimal_places=3, null=True, blank=True)
    # Referencia a la imagen (ruta de assets del frontend o URL), no el archivo.
    imagen = models.CharField(max_length=255, blank=True)
    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.PROTECT,
        db_column='id_categoria',
        related_name='productos',
    )

    class Meta:
        db_table = 'producto'
        verbose_name = 'Producto'
        verbose_name_plural = 'Productos'

    def __str__(self):
        return self.nombre


class DetalleFormula(models.Model):
    id_detalle_formula = models.AutoField(primary_key=True)
    producto = models.ForeignKey(
        Producto,
        on_delete=models.CASCADE,
        db_column='id_producto',
        related_name='formula',
    )
    materia_prima = models.ForeignKey(
        'materia_prima.MateriaPrima',
        on_delete=models.PROTECT,
        db_column='id_materia_prima',
        related_name='formulas',
    )
    # Cantidad de materia prima necesaria para producir una unidad del producto.
    cantidad_necesaria = models.DecimalField(max_digits=12, decimal_places=3)

    class Meta:
        db_table = 'detalle_formula'
        verbose_name = 'Detalle de fórmula'
        verbose_name_plural = 'Detalles de fórmula'
        # Una materia prima aparece una sola vez en la fórmula de cada producto.
        constraints = [
            models.UniqueConstraint(fields=['producto', 'materia_prima'], name='unique_materia_prima_por_producto'),
        ]

    def __str__(self):
        return f'{self.producto}: {self.cantidad_necesaria} de {self.materia_prima}'


class TipoMovimientoProducto(models.TextChoices):
    INGRESO = 'ingreso', 'Ingreso'
    VENTA = 'venta', 'Venta'
    AJUSTE = 'ajuste', 'Ajuste'


class MovimientoInventarioProducto(models.Model):
    id_movimiento_producto = models.AutoField(primary_key=True)
    fecha = models.DateTimeField(auto_now_add=True)
    tipo_movimiento = models.CharField(max_length=20, choices=TipoMovimientoProducto.choices)
    # Puede ser negativa en los ajustes.
    cantidad = models.DecimalField(max_digits=12, decimal_places=3)
    producto = models.ForeignKey(
        Producto,
        on_delete=models.PROTECT,
        db_column='id_producto',
        related_name='movimientos',
    )
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        db_column='id_usuario',
        related_name='movimientos_producto',
    )

    class Meta:
        db_table = 'movimiento_inventario_producto'
        verbose_name = 'Movimiento de inventario de producto'
        verbose_name_plural = 'Movimientos de inventario de producto'
        ordering = ['-fecha']

    def __str__(self):
        return f'{self.get_tipo_movimiento_display()} de {self.cantidad} - {self.producto}'
