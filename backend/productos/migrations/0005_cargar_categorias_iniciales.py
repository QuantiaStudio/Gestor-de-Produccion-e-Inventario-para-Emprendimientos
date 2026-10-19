from django.db import migrations


CATEGORIAS_INICIALES = [
    "Mesas",
    "Bibliotecas",
    "Escritorios",
    "Comodas",
    "Racks",
    "Banquetas",
    "Sillas",
    "Decks",
]


def cargar_categorias(apps, schema_editor):
    Categoria = apps.get_model("productos", "Categoria")
    base_datos = schema_editor.connection.alias

    for nombre in CATEGORIAS_INICIALES:
        Categoria.objects.using(base_datos).get_or_create(nombre=nombre)


class Migration(migrations.Migration):
    dependencies = [
        ("productos", "0004_ordenar_lineas_de_formula"),
    ]

    operations = [
        migrations.RunPython(
            cargar_categorias,
            reverse_code=migrations.RunPython.noop,
        ),
    ]
