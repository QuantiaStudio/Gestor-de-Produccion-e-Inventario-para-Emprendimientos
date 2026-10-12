from django.urls import path

from .views import OrdenProduccionListCreateView

urlpatterns = [
    path('', OrdenProduccionListCreateView.as_view(), name='orden-produccion-list-create'),
]
