from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Sum

from .models import OrdenProduccion, ReservaMateriaPrima, EstadoOrden

class IniciarOrdenAPIView(APIView):
    def post(self, request, pk):
        orden = get_object_or_404(OrdenProduccion, pk=pk)

        if orden.estado != EstadoOrden.PENDIENTE:
            return Response(
                {"error": f"No se puede iniciar una orden en estado '{orden.estado}'. Debe estar 'Pendiente'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        detalles_formula = getattr(orden.producto, 'detalles_formula', None) or orden.producto.formula.all()

        if not detalles_formula.exists():
            return Response(
                {"error": "El producto de esta orden no tiene una fórmula/receta configurada."},
                status=status.HTTP_400_BAD_REQUEST
            )

        insumos_a_reservar = []
        for detalle in detalles_formula.all():
            materia_prima = detalle.materia_prima
            cantidad_requerida = detalle.cantidad * orden.cantidad

            
            stock_fisico = materia_prima.stock_actual if hasattr(materia_prima, 'stock_actual') else materia_prima.stock

            reservas_activas = ReservaMateriaPrima.objects.filter(
                materia_prima=materia_prima,
                activa=True
            ).aggregate(total=Sum('cantidad_reservada'))['total'] or 0

            disponible = stock_fisico - reservas_activas

            if disponible < cantidad_requerida:
                return Response(
                    {
                        "error": f"Insumo insuficiente: {materia_prima.nombre}. "
                                 f"Requerido: {cantidad_requerida}, Disponible: {disponible} "
                                 f"(Stock Físico: {stock_fisico}, Reservado: {reservas_activas})."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            insumos_a_reservar.append({
                'materia_prima': materia_prima,
                'cantidad': cantidad_requerida
            })

        try:
            with transaction.atomic():
                orden.estado = EstadoOrden.EN_PRODUCCION
                orden.save()

                for item in insumos_a_reservar:
                    ReservaMateriaPrima.objects.create(
                        orden=orden,
                        materia_prima=item['materia_prima'],
                        cantidad_reservada=item['cantidad'],
                        activa=True
                    )

            return Response(
                {"mensaje": f"Orden #{orden.id} iniciada correctamente con estado 'En Producción' y reservas activadas."},
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {"error": f"Error al procesar las reservas de la orden: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )