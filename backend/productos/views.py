from config.stubs import ColeccionNoImplementada, ElementoNoImplementado
from django.db import transaction
from django.db.models import ProtectedError
from rest_framework import status
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from .models import EstadoProducto, Producto

ESTADOS_ORDEN_ACTIVA = ['Pendiente', 'En Produccion']

class CategoriaListView(ColeccionNoImplementada):
    pass


class CategoriaDetailView(ElementoNoImplementado):
    pass


class ProductoListView(ColeccionNoImplementada):
    pass


class ProductoDetailView(ElementoNoImplementado):

    def delete(self, request, pk):
        producto = Producto.objects.filter(pk=pk).first()
        if producto is None:
            raise NotFound('El producto no existe.')

        #no se elimina si tiene órdenes pendientes o en producción
        tiene_ordenes_activas = producto.detalles_produccion.filter(
            orden__estado__nombre__in=ESTADOS_ORDEN_ACTIVA
        ).exists()

        if tiene_ordenes_activas:
            return Response(
                {
                    'detail': 'No se puede eliminar: el producto tiene órdenes de producción pendientes o en proceso.',
                    'code': 'en_uso',
                },
                status=status.HTTP_409_CONFLICT,
            )

        try:
            with transaction.atomic():
                producto.delete()  
        except ProtectedError:
            #tiene historial (órdenes cerradas o movimientos), se da de baja lógica
            producto.estado = EstadoProducto.INACTIVO
            producto.save(update_fields=['estado'])
            return Response(
                {
                    'detail': 'El producto tiene historial registrado, por lo que se desactivó en lugar de eliminarse.',
                    'code': 'en_uso',
                },
                status=status.HTTP_409_CONFLICT,
            )

        return Response(status=status.HTTP_204_NO_CONTENT)


class DetalleFormulaListView(ColeccionNoImplementada):
    pass


class DetalleFormulaDetailView(ElementoNoImplementado):
    pass


class MovimientoInventarioProductoListView(ColeccionNoImplementada):
    pass


class MovimientoInventarioProductoDetailView(ElementoNoImplementado):
    # Los movimientos son un registro histórico: no se modifican ni se eliminan.
    http_method_names = ['get', 'options']
