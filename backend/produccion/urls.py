from django.urls import path

from .views import (
    DetalleOrdenProduccionDetailView,
    DetalleOrdenProduccionListView,
    EstadoDetailView,
    EstadoListView,
    OrdenProduccionDetailView,
    OrdenProduccionListView,
)

urlpatterns = [
    path('estados/', EstadoListView.as_view(), name='estado-list'),
    path('estados/<int:pk>/', EstadoDetailView.as_view(), name='estado-detail'),
    path('ordenes-produccion/', OrdenProduccionListView.as_view(), name='orden-produccion-list'),
    path('ordenes-produccion/<int:pk>/', OrdenProduccionDetailView.as_view(), name='orden-produccion-detail'),
    path(
        'detalles-orden-produccion/',
        DetalleOrdenProduccionListView.as_view(),
        name='detalle-orden-produccion-list',
    ),
    path(
        'detalles-orden-produccion/<int:pk>/',
        DetalleOrdenProduccionDetailView.as_view(),
        name='detalle-orden-produccion-detail',
    ),
]
from .views import IniciarOrdenAPIView

urlpatterns = [
    path('ordenes/<int:pk>/iniciar/', IniciarOrdenAPIView.as_view(), name='iniciar-orden'),
<<<<<<< HEAD
]
=======
    path('ordenes/<int:pk>/finalizar/', FinalizarOrdenAPIView.as_view(), name='finalizar-orden'),
]
>>>>>>> c1ad498 (feat(produccion): implementar vistas y rutas para iniciar y finalizar orden)
