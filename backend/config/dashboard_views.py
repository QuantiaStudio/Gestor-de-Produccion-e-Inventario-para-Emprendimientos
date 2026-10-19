from django.contrib.auth import get_user_model
from django.db.models import Sum
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from productos.models import Producto
from produccion.models import OrdenProduccion


class DashboardResumenView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        Usuario = get_user_model()
        unidades_en_produccion = OrdenProduccion.objects.filter(
            estado__nombre='En Produccion'
        ).aggregate(total=Sum('detalles__cantidad_planificada'))['total'] or 0
        return Response({
            'usuarios_activos': Usuario.objects.filter(estado=True).count(),
            'productos_en_produccion': float(unidades_en_produccion),
            'disenos_catalogo': Producto.objects.count(),
        })
