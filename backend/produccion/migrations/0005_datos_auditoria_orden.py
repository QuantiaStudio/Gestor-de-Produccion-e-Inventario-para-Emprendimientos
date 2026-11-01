import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('produccion', '0004_reservamateriaprima'),
        ('usuarios', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='ordenproduccion',
            name='observaciones',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='ordenproduccion',
            name='operador',
            field=models.ForeignKey(
                blank=True,
                db_column='id_usuario',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='ordenes_produccion',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
