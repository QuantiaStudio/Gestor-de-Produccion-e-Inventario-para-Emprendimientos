from config.stubs import ColeccionNoImplementada, ElementoNoImplementado, EndpointNoImplementado


class UsuarioListView(ColeccionNoImplementada):
    pass


class UsuarioDetailView(ElementoNoImplementado):
    pass


class LoginView(EndpointNoImplementado):
    http_method_names = ['post', 'options']


class LogoutView(EndpointNoImplementado):
    http_method_names = ['post', 'options']


class UsuarioActualView(EndpointNoImplementado):
    http_method_names = ['get', 'options']
