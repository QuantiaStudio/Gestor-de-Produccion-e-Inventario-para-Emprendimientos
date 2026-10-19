"""Vistas base para endpoints definidos en el contrato (API.md) que todavía no están implementados.

Cada vista concreta hereda de una de estas clases y, al implementarla, se reemplaza el
método correspondiente. Los métodos que no están en http_method_names devuelven 405.
"""
from rest_framework.views import APIView

from .exceptions import NoImplementado


class EndpointNoImplementado(APIView):
    def _no_implementado(self, request, *args, **kwargs):
        raise NoImplementado(f'El endpoint {request.method} {request.path} todavía no está implementado.')

    get = post = put = patch = delete = _no_implementado


class ColeccionNoImplementada(EndpointNoImplementado):
    """/recurso/ -> listar (GET) y crear (POST)."""

    http_method_names = ['get', 'post', 'options']


class ElementoNoImplementado(EndpointNoImplementado):
    """/recurso/{id}/ -> obtener (GET), reemplazar (PUT), actualizar (PATCH) y eliminar (DELETE)."""

    http_method_names = ['get', 'put', 'patch', 'delete', 'options']
