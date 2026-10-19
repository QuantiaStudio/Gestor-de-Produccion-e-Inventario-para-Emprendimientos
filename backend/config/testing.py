"""Utilidades compartidas por los tests de la API."""
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from usuarios.models import Rol, Usuario


class APITestCaseAutenticado(APITestCase):
    """Todos los endpoints de negocio requieren token (API.md §1).

    Cada test arranca con el header `Authorization: Token <token>` de un administrador ya cargado.
    Para probar un pedido sin token, llamar a `self.client.credentials()` antes del pedido.
    """

    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()
        cls.usuario = Usuario.objects.create_user(
            email='admin@correo.com',
            password='UnaClaveSegura2026',
            nombre='Ana',
            apellido='Pérez',
            rol=Rol.ADMIN,
        )
        cls.token = Token.objects.create(user=cls.usuario)

    def setUp(self):
        super().setUp()
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
