from django.urls import path

from .views import (
    MateriaPrimaDetailView,
    MateriaPrimaListView,
    MovimientoStockMateriaPrimaDetailView,
    MovimientoStockMateriaPrimaListView,
)

urlpatterns = [
    path('materias-primas/', MateriaPrimaListView.as_view(), name='materia-prima-list'),
    path('materias-primas/<int:pk>/', MateriaPrimaDetailView.as_view(), name='materia-prima-detail'),
    path(
        'movimientos-materia-prima/',
        MovimientoStockMateriaPrimaListView.as_view(),
        name='movimiento-materia-prima-list',
    ),
    path(
        'movimientos-materia-prima/<int:pk>/',
        MovimientoStockMateriaPrimaDetailView.as_view(),
        name='movimiento-materia-prima-detail',
    ),
]
