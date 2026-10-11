from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import MateriaPrima
from .serializers import MateriaPrimaSerializer


class MateriaPrimaListView(APIView):
    """TK-02-06: listado de materias primas."""

    def get(self, request):
        materias_primas = MateriaPrima.objects.all().order_by('nombre')
        serializer = MateriaPrimaSerializer(materias_primas, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MateriaPrimaDetailView(APIView):
    """TK-02-07: detalle de una materia prima."""

    def get_object(self, pk):
        try:
            return MateriaPrima.objects.get(pk=pk)
        except MateriaPrima.DoesNotExist:
            return None

    def get(self, request, pk):
        materia_prima = self.get_object(pk)
        if materia_prima is None:
            return Response(
                {'detail': 'La materia prima solicitada no existe.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = MateriaPrimaSerializer(materia_prima)
        return Response(serializer.data, status=status.HTTP_200_OK)
