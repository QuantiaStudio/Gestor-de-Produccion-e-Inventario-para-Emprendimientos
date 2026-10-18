from django.urls import path

from .views import (
    LoginView,
    LogoutView,
    RegistroAdministradorView,
    UsuarioActualView,
    UsuarioDetailView,
    UsuarioListView,
)

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/registro/', RegistroAdministradorView.as_view(), name='auth-register-admin'),
    path('auth/logout/', LogoutView.as_view(), name='auth-logout'),
    path('auth/me/', UsuarioActualView.as_view(), name='auth-me'),
    path('usuarios/', UsuarioListView.as_view(), name='usuario-list'),
    path('usuarios/<int:pk>/', UsuarioDetailView.as_view(), name='usuario-detail'),
]
