from rest_framework import status
from rest_framework.response import Response

from config.stubs import ColeccionNoImplementada, ElementoNoImplementado

from .models import DetalleOrdenProduccion, OrdenProduccion
from .serializers import DetalleOrdenProduccionSerializer, OrdenProduccionSerializer
from .servicios import validar_disponibilidad_formula


class EstadoListView(ColeccionNoImplementada):
    pass


class EstadoDetailView(ElementoNoImplementado):
    pass


class OrdenProduccionListView(ColeccionNoImplementada):
    """TK-13-01: crear ordenes de produccion. TK-13-02: consultarlas."""

    def get(self, request):
        ordenes = OrdenProduccion.objects.all()

        id_estado = request.query_params.get('id_estado')
        if id_estado is not None:
            ordenes = ordenes.filter(estado_id=id_estado)

        desde = request.query_params.get('desde')
        if desde is not None:
            ordenes = ordenes.filter(fecha_creacion__gte=desde)

        hasta = request.query_params.get('hasta')
        if hasta is not None:
            ordenes = ordenes.filter(fecha_creacion__lte=hasta)

        serializer = OrdenProduccionSerializer(ordenes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = OrdenProduccionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class OrdenProduccionDetailView(ElementoNoImplementado):
    pass


class DetalleOrdenProduccionListView(ColeccionNoImplementada):
    """TK-13-03: calcular requerimientos y disponibilidad al agregar un producto a la orden."""

    def get(self, request):
        detalles = DetalleOrdenProduccion.objects.all()

        id_orden = request.query_params.get('id_orden')
        if id_orden is not None:
            detalles = detalles.filter(orden_id=id_orden)

        id_producto = request.query_params.get('id_producto')
        if id_producto is not None:
            detalles = detalles.filter(producto_id=id_producto)

        serializer = DetalleOrdenProduccionSerializer(detalles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = DetalleOrdenProduccionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        producto = serializer.validated_data['producto']
        cantidad_planificada = serializer.validated_data['cantidad_planificada']
        error = validar_disponibilidad_formula(producto, cantidad_planificada)
        if error is not None:
            return Response(
                {'detail': error, 'code': 'stock_insuficiente'},
                status=status.HTTP_409_CONFLICT,
            )

        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class DetalleOrdenProduccionDetailView(ElementoNoImplementado):
    pass
