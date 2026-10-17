from django.urls import path

from .views import (
    CategoriaDetailView,
    CategoriaListView,
    DetalleFormulaDetailView,
    DetalleFormulaListView,
    MovimientoInventarioProductoDetailView,
    MovimientoInventarioProductoListView,
    ProductoDetailView,
    ProductoListView,
)

urlpatterns = [
    path('categorias/', CategoriaListView.as_view(), name='categoria-list'),
    path('categorias/<int:pk>/', CategoriaDetailView.as_view(), name='categoria-detail'),
    path('productos/', ProductoListView.as_view(), name='producto-list'),
    path('productos/<int:pk>/', ProductoDetailView.as_view(), name='producto-detail'),
    path('detalles-formula/', DetalleFormulaListView.as_view(), name='detalle-formula-list'),
    path('detalles-formula/<int:pk>/', DetalleFormulaDetailView.as_view(), name='detalle-formula-detail'),
    path(
        'movimientos-producto/',
        MovimientoInventarioProductoListView.as_view(),
        name='movimiento-producto-list',
    ),
    path(
        'movimientos-producto/<int:pk>/',
        MovimientoInventarioProductoDetailView.as_view(),
        name='movimiento-producto-detail',
    ),
]
