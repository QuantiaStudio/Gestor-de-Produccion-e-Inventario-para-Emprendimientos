from django.urls import reverse
from rest_framework import status

from config.testing import APITestCaseAutenticado

from .models import MateriaPrima

URL_MATERIAS_PRIMAS = reverse('materia-prima-list')


class ListarMateriasPrimasTests(APITestCaseAutenticado):
    """GET /api/v1/materias-primas/ (API.md §6.1).

    Usa las materias primas que carga la migración 0002_cargar_materias_primas.
    """

    def test_sin_token_responde_401(self):
        self.client.credentials()

        respuesta = self.client.get(URL_MATERIAS_PRIMAS)

        self.assertEqual(respuesta.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_lista_las_materias_primas_ordenadas_por_nombre(self):
        respuesta = self.client.get(URL_MATERIAS_PRIMAS)

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        nombres = [materia['nombre'] for materia in respuesta.json()]
        self.assertEqual(len(nombres), 30)
        self.assertEqual(nombres[0], 'Adhesivo de contacto')
        # MySQL compara sin distinguir mayúsculas: "Madera ..." va antes que "MDF ...".
        self.assertEqual(nombres, sorted(nombres, key=str.casefold))

    def test_devuelve_los_campos_del_contrato(self):
        materias = self.client.get(URL_MATERIAS_PRIMAS).json()
        barniz = next(materia for materia in materias if materia['nombre'] == 'Barniz transparente')

        self.assertEqual(barniz, {
            'id_materia_prima': MateriaPrima.objects.get(nombre='Barniz transparente').pk,
            'nombre': 'Barniz transparente',
            'descripcion': 'Recubrimiento protector transparente para superficies de madera.',
            'unidad_medida': 'L',
            'stock_actual': '10.000',
            'stock_minimo': '2.000',
        })
