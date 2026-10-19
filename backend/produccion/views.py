from decimal import Decimal

from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from config.stubs import ColeccionNoImplementada, ElementoNoImplementado

from .models import DetalleOrdenProduccion, Estado, OrdenProduccion, ReservaMateriaPrima
from .serializers import DetalleOrdenProduccionSerializer, OrdenProduccionSerializer
from .servicios import calcular_disponibilidad


class EstadoOrden:
    PENDIENTE = 'Pendiente'
    EN_PRODUCCION = 'En Produccion'
    FINALIZADA = 'Finalizada'
    CANCELADA = 'Cancelada'


def obtener_estado(nombre):
    return get_object_or_404(Estado, nombre=nombre)


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
    """Iniciar orden, reservar insumos y validar disponibilidad/transiciones"""
    def post(self, request, pk):
        orden = get_object_or_404(OrdenProduccion, pk=pk)

        if orden.estado.nombre != EstadoOrden.PENDIENTE:
            return Response(
                {"error": f"No se puede iniciar una orden en estado '{orden.estado.nombre}'. Debe estar 'Pendiente'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        detalles = list(
            orden.detalles.select_related('producto').prefetch_related('producto__formula__materia_prima')
        )
        if not detalles:
            return Response(
                {"error": "La orden no tiene productos para iniciar."},
                status=status.HTTP_400_BAD_REQUEST
            )

        requerimientos = {}
        for detalle in detalles:
            formulas = list(detalle.producto.formula.select_related('materia_prima'))
            if not formulas:
                return Response(
                    {"error": f"El producto '{detalle.producto.nombre}' no tiene una fórmula configurada."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            for formula in formulas:
                materia_prima = formula.materia_prima
                cantidad = formula.cantidad_necesaria * detalle.cantidad_planificada
                requerimientos[materia_prima.pk] = (
                    materia_prima,
                    requerimientos.get(materia_prima.pk, (materia_prima, Decimal('0')))[1] + cantidad,
                )

        for materia_prima, cantidad_requerida in requerimientos.values():
            disponible = calcular_disponibilidad(materia_prima)
            if disponible < cantidad_requerida:
                return Response(
                    {
                        "error": f"Insumo insuficiente: {materia_prima.nombre}. "
                                 f"Requerido: {cantidad_requerida}, Disponible: {disponible}."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        try:
            with transaction.atomic():
                orden.estado = obtener_estado(EstadoOrden.EN_PRODUCCION)
                orden.fecha_inicio = timezone.now()
                orden.save(update_fields=['estado', 'fecha_inicio'])

                for materia_prima, cantidad in requerimientos.values():
                    ReservaMateriaPrima.objects.create(
                        orden=orden,
                        materia_prima=materia_prima,
                        cantidad_reservada=cantidad,
                        activa=True
                    )

            return Response(
                {"mensaje": f"Orden #{orden.pk} iniciada correctamente con estado 'En Produccion' y reservas activadas."},
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {"error": f"Error al procesar las reservas de la orden: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class FinalizarOrdenAPIView(APIView):
    """Finalización transaccional, impacto en inventario y prevención de duplicados"""
    def post(self, request, pk):
        orden = get_object_or_404(OrdenProduccion, pk=pk)

        if orden.estado.nombre != EstadoOrden.EN_PRODUCCION:
            return Response(
                {"error": f"No se puede finalizar una orden en estado '{orden.estado.nombre}'. Debe estar 'En Produccion'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        reservas = ReservaMateriaPrima.objects.filter(orden=orden, activa=True)
        if not reservas.exists():
            return Response(
                {"error": "La orden no tiene reservas activas para procesar la finalización."},
                status=status.HTTP_400_BAD_REQUEST
            )

        detalles = list(orden.detalles.select_related('producto'))
        if not detalles:
            return Response(
                {"error": "La orden no tiene productos para finalizar."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                for reserva in reservas:
                    materia_prima = reserva.materia_prima
                    materia_prima.stock_actual -= reserva.cantidad_reservada
                    materia_prima.save()

                    reserva.activa = False
                    reserva.save()

                for detalle in detalles:
                    cantidad_producida = detalle.cantidad_producida or detalle.cantidad_planificada
                    detalle.producto.stock_actual += cantidad_producida
                    detalle.producto.save(update_fields=['stock_actual'])

                orden.estado = obtener_estado(EstadoOrden.FINALIZADA)
                orden.save(update_fields=['estado'])

            return Response(
                {"mensaje": f"Orden #{orden.pk} finalizada correctamente. Inventario actualizado y reservas liberadas."},
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {"error": f"Error al finalizar la orden de producción: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CancelarOrdenAPIView(APIView):
    """Cancela órdenes abiertas y libera sus reservas activas."""
    def post(self, request, pk):
        orden = get_object_or_404(OrdenProduccion, pk=pk)

        if orden.estado.nombre not in [EstadoOrden.PENDIENTE, EstadoOrden.EN_PRODUCCION]:
            return Response(
                {"error": f"No se puede cancelar una orden en estado '{orden.estado.nombre}'. Solo se pueden cancelar órdenes 'Pendiente' o 'En Produccion'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                reservas = ReservaMateriaPrima.objects.filter(orden=orden, activa=True)
                for reserva in reservas:
                    reserva.activa = False
                    reserva.save()

                orden.estado = obtener_estado(EstadoOrden.CANCELADA)
                orden.save(update_fields=['estado'])

            return Response(
                {"mensaje": f"Orden #{orden.pk} cancelada correctamente y reservas liberadas."},
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {"error": f"Error al cancelar la orden de producción: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
