from decimal import Decimal

from django.db.models import Sum

from .models import ReservaMateriaPrima


def calcular_disponibilidad(materia_prima):
    """Stock físico de la materia prima menos sus reservas activas."""
    reservado = ReservaMateriaPrima.objects.filter(
        materia_prima=materia_prima,
        activa=True,
    ).aggregate(total=Sum('cantidad_reservada'))['total'] or Decimal('0')
    return materia_prima.stock_actual - reservado


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
