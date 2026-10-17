from django.db import transaction
from django.db.models import Sum
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from config.stubs import ColeccionNoImplementada, ElementoNoImplementado

from .models import DetalleOrdenProduccion, EstadoOrden, OrdenProduccion, ReservaMateriaPrima
from .serializers import DetalleOrdenProduccionSerializer, OrdenProduccionSerializer
from .servicios import validar_disponibilidad_formula


class EstadoListView(ColeccionNoImplementada):
    pass


class EstadoDetailView(ElementoNoImplementado):
    pass


class OrdenProduccionListView(ColeccionNoImplementada):
    """crear ordenes de produccion. TK-13-02: consultarlas."""

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
    """calcular requerimientos y disponibilidad al agregar un producto a la orden."""

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


# Vistas del flujo transaccional 

class IniciarOrdenAPIView(APIView):
    """Iniciar orden, reservar insumos y validar disponibilidad"""
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


class FinalizarOrdenAPIView(APIView):
    """Finalización transaccional e inventario"""
    def post(self, request, pk):
        orden = get_object_or_404(OrdenProduccion, pk=pk)

        if orden.estado != EstadoOrden.EN_PRODUCCION:
            return Response(
                {"error": f"No se puede finalizar una orden en estado '{orden.estado}'. Debe estar 'En Producción'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        reservas = ReservaMateriaPrima.objects.filter(orden=orden, activa=True)

        try:
            with transaction.atomic():
                for reserva in reservas:
                    materia_prima = reserva.materia_prima
                    if hasattr(materia_prima, 'stock_actual'):
                        materia_prima.stock_actual -= reserva.cantidad_reservada
                    else:
                        materia_prima.stock -= reserva.cantidad_reservada
                    materia_prima.save()

                    reserva.activa = False
                    reserva.save()

                producto = orden.producto
                if hasattr(producto, 'stock_actual'):
                    producto.stock_actual += orden.cantidad
                elif hasattr(producto, 'stock'):
                    producto.stock += orden.cantidad
                producto.save()

                orden.estado = EstadoOrden.FINALIZADA
                orden.save()

            return Response(
                {"mensaje": f"Orden #{orden.id} finalizada correctamente. Inventario actualizado y reservas liberadas."},
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {"error": f"Error al finalizar la orden de producción: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CancelarOrdenAPIView(APIView):
    """Cancelación y liberación de reservas"""
    def post(self, request, pk):
        orden = get_object_or_404(OrdenProduccion, pk=pk)

        if orden.estado not in [EstadoOrden.PENDIENTE, EstadoOrden.EN_PRODUCCION]:
            return Response(
                {"error": f"No se puede cancelar una orden en estado '{orden.estado}'. Solo se pueden cancelar órdenes 'Pendientes' o 'En Producción'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                reservas = ReservaMateriaPrima.objects.filter(orden=orden, activa=True)
                for reserva in reservas:
                    reserva.activa = False
                    reserva.save()

                orden.estado = EstadoOrden.CANCELADA
                orden.save()

            return Response(
                {"mensaje": f"Orden #{orden.id} cancelada correctamente y reservas liberadas."},
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {"error": f"Error al cancelar la orden de producción: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )