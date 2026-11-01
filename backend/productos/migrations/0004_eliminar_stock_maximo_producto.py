from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('productos', '0003_campos_producto_y_formula_unica'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='producto',
            name='stock_maximo',
        ),
    ]
