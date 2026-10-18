from config.stubs import ColeccionNoImplementada, ElementoNoImplementado


class MateriaPrimaListView(ColeccionNoImplementada):
    pass


class MateriaPrimaDetailView(ElementoNoImplementado):
    pass


class MovimientoStockMateriaPrimaListView(ColeccionNoImplementada):
    pass


class MovimientoStockMateriaPrimaDetailView(ElementoNoImplementado):
    # Los movimientos son un registro histórico: no se modifican ni se eliminan.
    http_method_names = ['get', 'options']
