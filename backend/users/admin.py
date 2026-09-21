from django.contrib import admin
from .models import Patient


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'age', 'preferred_language', 'current_level', 'created_at')
    search_fields = ('name',)
