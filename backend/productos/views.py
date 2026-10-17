from config.stubs import ColeccionNoImplementada, ElementoNoImplementado


class CategoriaListView(ColeccionNoImplementada):
    pass


class CategoriaDetailView(ElementoNoImplementado):
    pass


class ProductoListView(ColeccionNoImplementada):
    pass


class ProductoDetailView(ElementoNoImplementado):
    pass


class DetalleFormulaListView(ColeccionNoImplementada):
    pass


class DetalleFormulaDetailView(ElementoNoImplementado):
    pass


class MovimientoInventarioProductoListView(ColeccionNoImplementada):
    pass


class MovimientoInventarioProductoDetailView(ElementoNoImplementado):
    # Los movimientos son un registro histórico: no se modifican ni se eliminan.
    http_method_names = ['get', 'options']
