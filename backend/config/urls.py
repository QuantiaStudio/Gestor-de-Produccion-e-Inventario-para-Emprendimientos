"""
URL configuration for config project.

The urlpatterns list routes URLs for the API and Django admin.
"""
from django.contrib import admin
from django.urls import include, path
from .dashboard_views import DashboardResumenView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/dashboard/resumen/', DashboardResumenView.as_view(), name='dashboard-resumen'),

    path('api/v1/', include('usuarios.urls')),
    path('api/v1/materias-primas/', include('materia_prima.urls')),
    path('api/v1/', include('productos.urls')),
    path('api/v1/', include('produccion.urls')),
]
