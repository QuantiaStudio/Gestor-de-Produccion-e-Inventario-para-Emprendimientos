from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

URL_MATERIAS_PRIMAS = reverse('materia-prima-list')


class ListarMateriasPrimasTests(APITestCase):
    """GET /api/v1/materias-primas/ (API.md §6.1)."""

    fixtures = ['materias_primas']

    def test_lista_las_materias_primas_ordenadas_por_nombre(self):
        respuesta = self.client.get(URL_MATERIAS_PRIMAS)

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertEqual(
            [materia['nombre'] for materia in respuesta.json()],
            ['Barniz Transparente', 'Contrachapado 18mm', 'Madera de Roble', 'Pintura Blanca', 'Tornillos 3mm'],
        )

    def test_devuelve_los_campos_del_contrato(self):
        materias = self.client.get(URL_MATERIAS_PRIMAS).json()
        madera = next(materia for materia in materias if materia['id_materia_prima'] == 1)

        self.assertEqual(madera, {
            'id_materia_prima': 1,
            'nombre': 'Madera de Roble',
            'descripcion': 'Madera dura de alta calidad para muebles estructurales.',
            'unidad_medida': 'unidad',
            'stock_actual': '28.000',
            'stock_minimo': '8.000',
        })
