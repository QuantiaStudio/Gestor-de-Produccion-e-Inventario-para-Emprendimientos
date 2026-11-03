from decimal import Decimal

from django.db import transaction
from django.db.models import Sum

from materia_prima.models import MateriaPrima
from .models import ReservaMateriaPrima


class StockInsuficienteError(ValueError):
    """Se lanza cuando una reserva supera el stock disponible."""


def calcular_disponibilidad(materia_prima):
    """Stock físico de la materia prima menos sus reservas activas."""
    reservado = ReservaMateriaPrima.objects.filter(
        materia_prima=materia_prima,
        activa=True,
    ).aggregate(total=Sum('cantidad_reservada'))['total'] or Decimal('0')
    return materia_prima.stock_actual - reservado


def calcular_requerimientos(detalles):
    requerimientos = {}
    for detalle in detalles:
        for formula in detalle.producto.formula.select_related('materia_prima'):
            cantidad = (
                formula.cantidad_necesaria * detalle.cantidad_planificada
            ).quantize(Decimal('0.001'))
            materia_prima, acumulado = requerimientos.get(
                formula.materia_prima_id,
                (formula.materia_prima, Decimal('0')),
            )
            requerimientos[formula.materia_prima_id] = (
                materia_prima,
                acumulado + cantidad,
            )
    return requerimientos


@transaction.atomic
def reservar_materias_primas(orden, requerimientos):
    reservas_activas = ReservaMateriaPrima.objects.filter(orden=orden, activa=True)
    if reservas_activas.exists():
        return

    materias_primas = {
        materia_prima.pk: materia_prima
        for materia_prima in MateriaPrima.objects.select_for_update().filter(
            pk__in=requerimientos
        )
    }
    for materia_prima_id, (_, cantidad_requerida) in requerimientos.items():
        materia_prima = materias_primas[materia_prima_id]
        disponible = calcular_disponibilidad(materia_prima)
        if disponible < cantidad_requerida:
            raise StockInsuficienteError(
                f"Stock insuficiente de '{materia_prima.nombre}': "
                f"disponible {disponible}, requerido {cantidad_requerida}."
            )

    ReservaMateriaPrima.objects.bulk_create(
        ReservaMateriaPrima(
            orden=orden,
            materia_prima=materia_prima,
            cantidad_reservada=cantidad,
            activa=True,
        )
        for materia_prima, cantidad in requerimientos.values()
    )


def validar_disponibilidad_formula(producto, cantidad_solicitada):
    """Verifica que haya stock disponible de cada insumo de la fórmula del
    producto para producir la cantidad solicitada.

    Devuelve None si hay stock suficiente, o un mensaje de error (para la
    respuesta 409 stock_insuficiente de API.md) con el primer insumo que falta.
    """
    for detalle_formula in producto.formula.all():
        materia_prima = detalle_formula.materia_prima
        requerido = (detalle_formula.cantidad_necesaria * cantidad_solicitada).quantize(Decimal('0.001'))
        disponible = calcular_disponibilidad(materia_prima)
        if disponible < requerido:
            return (
                f"Stock insuficiente de '{materia_prima.nombre}': "
                f"disponible {disponible}, requerido {requerido}."
            )
    return None
