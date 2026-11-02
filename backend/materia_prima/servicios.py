from .models import MovimientoStockMateriaPrima, TipoMovimientoMateriaPrima


def registrar_movimiento(materia_prima, tipo_movimiento, cantidad, usuario, observacion=''):
    """Registra un movimiento de stock y actualiza stock_actual (API.md §6.2).

    `ingreso` suma, `consumo` resta, `ajuste` suma con signo (la `cantidad`
    de un ajuste ya trae el signo). `stock_actual` solo debe cambiar por
    esta vía, nunca con un `save()` directo sobre la materia prima.
    """
    if tipo_movimiento == TipoMovimientoMateriaPrima.CONSUMO:
        delta = -cantidad
    else:
        delta = cantidad

    nuevo_stock = materia_prima.stock_actual + delta
    if nuevo_stock < 0:
        raise ValueError(f"Stock insuficiente de '{materia_prima.nombre}' para registrar el movimiento.")

    movimiento = MovimientoStockMateriaPrima.objects.create(
        tipo_movimiento=tipo_movimiento,
        cantidad=cantidad,
        observacion=observacion,
        materia_prima=materia_prima,
        usuario=usuario,
    )

    materia_prima.stock_actual = nuevo_stock
    materia_prima.save(update_fields=['stock_actual'])

    return movimiento
