from django.urls import path

from .views import MateriaPrimaDetailView, MateriaPrimaListView

urlpatterns = [
    path('', MateriaPrimaListView.as_view(), name='materia-prima-list'),
    path('<int:pk>/', MateriaPrimaDetailView.as_view(), name='materia-prima-detail'),
]
