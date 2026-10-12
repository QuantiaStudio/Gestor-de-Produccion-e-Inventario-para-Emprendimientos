from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import EstadoOrden, OrdenProduccion
from .serializers import OrdenProduccionSerializer


class OrdenProduccionListCreateView(APIView):
    """TK-13-01: crear órdenes de producción."""

    def post(self, request):
        serializer = OrdenProduccionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # La orden siempre arranca Pendiente, sin reservar ni descontar insumos,
        # incluso si el stock es insuficiente (eso se valida recién al iniciarla).
        serializer.save(estado=EstadoOrden.PENDIENTE)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
