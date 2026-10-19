from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class Rol(models.TextChoices):
    ADMIN = 'ADMIN', 'Administrador'
    OPERARIO = 'OPERARIO', 'Operario'


class UsuarioManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El email es obligatorio.')
        usuario = self.model(email=self.normalize_email(email), **extra_fields)
        usuario.set_password(password)
        usuario.save(using=self._db)
        return usuario

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('rol', Rol.ADMIN)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class Usuario(AbstractBaseUser, PermissionsMixin):
    id_usuario = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128, db_column='contrasena')
    rol = models.CharField(max_length=20, choices=Rol.choices, default=Rol.OPERARIO)
    estado = models.BooleanField(default=True)

    objects = UsuarioManager()

    USERNAME_FIELD = 'email'
    EMAIL_FIELD = 'email'
    REQUIRED_FIELDS = ['nombre', 'apellido']

    class Meta:
        db_table = 'usuario'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

    def __str__(self):
        return f'{self.nombre} {self.apellido}'

    # Django usa is_active para habilitar el login; en el diagrama se llama estado.
    @property
    def is_active(self):
        return self.estado

    # Acceso al admin de Django para usuarios con rol ADMIN.
    @property
    def is_staff(self):
        return self.rol == Rol.ADMIN
