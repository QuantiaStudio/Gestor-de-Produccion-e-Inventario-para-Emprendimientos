from django.contrib.auth import get_user_model, password_validation
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email
from django.db import IntegrityError, transaction
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import APIException, AuthenticationFailed, ValidationError
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from config.stubs import ElementoNoImplementado


class UsuarioInactivo(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = 'El usuario se encuentra inactivo. Contacta a un administrador.'
    default_code = 'inactive_user'


def datos_usuario(usuario):
    return {
        'id_usuario': usuario.pk,
        'nombre': usuario.nombre,
        'apellido': usuario.apellido,
        'email': usuario.email,
        'rol': usuario.rol,
        'estado': usuario.estado,
    }


def crear_usuario(data, rol):
    if not isinstance(data, dict):
        raise ValidationError({'non_field_errors': ['El cuerpo debe ser un objeto JSON.']})

    nombre = data.get('nombre')
    apellido = data.get('apellido')
    email = data.get('email')
    contrasena = data.get('contrasena')
    errors = {}

    for campo, valor in (('nombre', nombre), ('apellido', apellido)):
        if not isinstance(valor, str) or not valor.strip():
            errors[campo] = ['Este campo es obligatorio.']
        elif len(valor.strip()) > 100:
            errors[campo] = ['No puede superar los 100 caracteres.']

    if not isinstance(email, str) or not email.strip():
        errors['email'] = ['Este campo es obligatorio.']
    else:
        email = email.strip().lower()
        try:
            validate_email(email)
        except DjangoValidationError:
            errors['email'] = ['Ingresá un correo electrónico válido.']

    if not isinstance(contrasena, str) or not contrasena:
        errors['contrasena'] = ['Este campo es obligatorio.']
    else:
        try:
            password_validation.validate_password(contrasena)
        except DjangoValidationError as error:
            errors['contrasena'] = error.messages

    if errors:
        raise ValidationError(errors)

    Usuario = get_user_model()
    if Usuario.objects.filter(email__iexact=email).exists():
        raise ValidationError({'email': ['Ya existe una cuenta con este correo.']})

    try:
        with transaction.atomic():
            return Usuario.objects.create_user(
                email=email,
                password=contrasena,
                nombre=nombre.strip(),
                apellido=apellido.strip(),
                rol=rol,
            )
    except IntegrityError:
        raise ValidationError({'email': ['Ya existe una cuenta con este correo.']})


class RegistroAdministradorView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        from .models import Rol

        usuario = crear_usuario(request.data, Rol.ADMIN)
        return Response(datos_usuario(usuario), status=status.HTTP_201_CREATED)


class UsuarioListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        Usuario = get_user_model()
        usuarios = Usuario.objects.order_by('id_usuario')
        return Response([datos_usuario(usuario) for usuario in usuarios])

    def post(self, request):
        from .models import Rol

        usuario = crear_usuario(request.data, Rol.OPERARIO)
        return Response(datos_usuario(usuario), status=status.HTTP_201_CREATED)


class UsuarioDetailView(ElementoNoImplementado):
    permission_classes = [IsAdminUser]


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        if not isinstance(request.data, dict):
            raise ValidationError({'non_field_errors': ['El cuerpo debe ser un objeto JSON.']})

        email = request.data.get('email')
        contrasena = request.data.get('contrasena')

        errors = {}
        if not isinstance(email, str) or not email.strip():
            errors['email'] = ['Este campo es obligatorio.']
        if not isinstance(contrasena, str) or not contrasena:
            errors['contrasena'] = ['Este campo es obligatorio.']
        if errors:
            raise ValidationError(errors)

        Usuario = get_user_model()
        usuario = Usuario.objects.filter(email__iexact=email.strip()).first()
        if usuario is None or not usuario.check_password(contrasena):
            raise AuthenticationFailed('Credenciales inválidas.')
        if not usuario.estado:
            raise UsuarioInactivo()

        token, _ = Token.objects.get_or_create(user=usuario)
        return Response(
            {'token': token.key, 'usuario': datos_usuario(usuario)},
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.auth.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UsuarioActualView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(datos_usuario(request.user))
