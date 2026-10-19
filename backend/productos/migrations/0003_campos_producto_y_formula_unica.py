from django.db import migrations, models


def asignar_codigos(apps, schema_editor):
    # Los productos que ya existían reciben un código a partir de su id: PT-001, PT-002, ...
    Producto = apps.get_model('productos', 'Producto')
    for producto in Producto.objects.filter(codigo__isnull=True):
        producto.codigo = f'PT-{producto.id_producto:03d}'
        producto.save(update_fields=['codigo'])


class Migration(migrations.Migration):

    dependencies = [
        ('productos', '0002_initial'),
    ]

    operations = [
        # codigo se agrega como nullable, se completa en los productos existentes
        # y recién después pasa a ser obligatorio y único.
        migrations.AddField(
            model_name='producto',
            name='codigo',
            field=models.CharField(max_length=20, null=True),
        ),
        migrations.RunPython(asignar_codigos, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='producto',
            name='codigo',
            field=models.CharField(max_length=20, unique=True),
        ),
        migrations.AddField(
            model_name='producto',
            name='stock_minimo',
            field=models.DecimalField(decimal_places=3, default=0, max_digits=12),
        ),
        migrations.AddField(
            model_name='producto',
            name='stock_maximo',
            field=models.DecimalField(blank=True, decimal_places=3, max_digits=12, null=True),
        ),
        migrations.AddField(
            model_name='producto',
            name='imagen',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddConstraint(
            model_name='detalleformula',
            constraint=models.UniqueConstraint(fields=('producto', 'materia_prima'), name='unique_materia_prima_por_producto'),
        ),
    ]
