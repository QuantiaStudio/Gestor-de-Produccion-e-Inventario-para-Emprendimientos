from django.db import migrations

ESTADOS = [
    (1, 'Pendiente'),
    (2, 'En Produccion'),
    (3, 'Finalizada'),
    (4, 'Cancelada'),
]


def cargar_estados(apps, schema_editor):
    Estado = apps.get_model('produccion', 'Estado')
    for id_estado, nombre in ESTADOS:
        Estado.objects.update_or_create(id_estado=id_estado, defaults={'nombre': nombre})


def borrar_estados(apps, schema_editor):
    Estado = apps.get_model('produccion', 'Estado')
    Estado.objects.filter(id_estado__in=[id_estado for id_estado, _ in ESTADOS]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('produccion', '0002_initial'),
    ]

    operations = [
        migrations.RunPython(cargar_estados, borrar_estados),
    ]
