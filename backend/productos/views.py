from django.db import transaction
from django.db.models import ProtectedError
from django.utils.dateparse import parse_date
from rest_framework import status
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.response import Response

from config.stubs import ColeccionNoImplementada, ElementoNoImplementado

from .models import Categoria, EstadoProducto, MovimientoInventarioProducto, Producto
from .serializers import CategoriaSerializer, MovimientoInventarioProductoSerializer, ProductoSerializer

ESTADOS_ORDEN_ACTIVA = ['Pendiente', 'En Produccion']


class CategoriaListView(ColeccionNoImplementada):
    def get(self, request):
        categorias = Categoria.objects.order_by('nombre')
        return Response(CategoriaSerializer(categorias, many=True).data)


class CategoriaDetailView(ElementoNoImplementado):
    pass


class ProductoListView(ColeccionNoImplementada):
    def get(self, request):
        productos = Producto.objects.select_related('categoria').prefetch_related(
            'formula__materia_prima'
        ).order_by('id_producto')

        id_categoria = request.query_params.get('id_categoria')
        if id_categoria:
            try:
                id_categoria = int(id_categoria)
            except ValueError as error:
                raise ValidationError({'id_categoria': 'Debe ser un número entero.'}) from error
            productos = productos.filter(categoria_id=id_categoria)

        estado = request.query_params.get('estado')
        if estado:
            if estado not in EstadoProducto.values:
                raise ValidationError({'estado': 'El estado indicado no es válido.'})
            productos = productos.filter(estado=estado)

        nombre = request.query_params.get('nombre')
        if nombre:
            productos = productos.filter(nombre__icontains=nombre.strip())

        return Response(ProductoSerializer(productos, many=True).data)

    def post(self, request):
        serializer = ProductoSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


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
    def get(self, request):
        movimientos = MovimientoInventarioProducto.objects.select_related('producto', 'usuario').order_by('-fecha')

        id_producto = request.query_params.get('id_producto')
        if id_producto:
            try:
                id_producto = int(id_producto)
            except ValueError as error:
                raise ValidationError({'id_producto': 'Debe ser un número entero.'}) from error
            movimientos = movimientos.filter(producto_id=id_producto)

        tipo_movimiento = request.query_params.get('tipo_movimiento')
        if tipo_movimiento:
            tipos_validos = [valor for valor, _ in MovimientoInventarioProducto._meta.get_field('tipo_movimiento').choices]
            if tipo_movimiento not in tipos_validos:
                raise ValidationError({'tipo_movimiento': 'El tipo de movimiento indicado no es válido.'})
            movimientos = movimientos.filter(tipo_movimiento=tipo_movimiento)

        for parametro, filtro in [('desde', 'fecha__date__gte'), ('hasta', 'fecha__date__lte')]:
            valor = request.query_params.get(parametro)
            if valor:
                fecha = parse_date(valor)
                if fecha is None:
                    raise ValidationError({parametro: 'La fecha debe tener formato AAAA-MM-DD.'})
                movimientos = movimientos.filter(**{filtro: fecha})

        return Response(MovimientoInventarioProductoSerializer(movimientos, many=True).data)


class MovimientoInventarioProductoDetailView(ElementoNoImplementado):
    # Los movimientos son un registro histórico: no se modifican ni se eliminan.
    http_method_names = ['get', 'options']
