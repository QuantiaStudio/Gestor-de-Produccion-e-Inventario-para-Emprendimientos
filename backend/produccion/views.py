from rest_framework import status
from rest_framework.response import Response

from config.stubs import ColeccionNoImplementada, ElementoNoImplementado

from .models import OrdenProduccion
from .serializers import OrdenProduccionSerializer


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
    pass


class DetalleOrdenProduccionDetailView(ElementoNoImplementado):
    pass
