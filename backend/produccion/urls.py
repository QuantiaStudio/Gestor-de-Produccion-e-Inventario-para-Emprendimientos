from django.urls import path
from .views import IniciarOrdenAPIView

urlpatterns = [
    path('ordenes/<int:pk>/iniciar/', IniciarOrdenAPIView.as_view(), name='iniciar-orden'),
]