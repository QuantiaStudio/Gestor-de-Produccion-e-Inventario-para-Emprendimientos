from django.contrib import admin
from .models import MateriaPrima

# Register your models here.
@admin.register(MateriaPrima)
class MateriaPrimaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'descripcion', 'unidad_medida', 'stock_actual', 'stock_minimo')
    search_fields = ('nombre',)
