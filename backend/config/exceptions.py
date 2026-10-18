from django.conf import settings
from django.db.models import ProtectedError
from rest_framework import status
from rest_framework.exceptions import APIException, ValidationError
from rest_framework.response import Response
from rest_framework.views import exception_handler


class NoImplementado(APIException):
    status_code = status.HTTP_501_NOT_IMPLEMENTED
    default_detail = 'Este endpoint todavía no está implementado.'
    default_code = 'not_implemented'


def custom_exception_handler(exc, context):
    """Devuelve todos los errores con el formato {"detail", "code"[, "errors"]}."""
    if isinstance(exc, ProtectedError):
        return Response(
            {
                'detail': 'No se puede eliminar porque otros registros lo están usando.',
                'code': 'en_uso',
            },
            status=status.HTTP_409_CONFLICT,
        )

    response = exception_handler(exc, context)

    if response is None:
        # En desarrollo se deja que Django muestre el traceback.
        if settings.DEBUG:
            return None
        return Response(
            {'detail': 'Error interno del servidor.', 'code': 'server_error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    if isinstance(exc, ValidationError):
        errors = response.data if isinstance(response.data, dict) else {'non_field_errors': response.data}
        response.data = {'detail': 'Datos inválidos.', 'code': 'invalid', 'errors': errors}
        return response

    detail = response.data.get('detail', '') if isinstance(response.data, dict) else str(response.data)
    response.data = {'detail': str(detail), 'code': getattr(detail, 'code', 'error')}
    return response
