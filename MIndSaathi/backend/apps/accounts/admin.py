from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_active')
    list_filter = ('role', 'is_active', 'is_staff', 'gender')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'phone')
    ordering = ('-date_joined',)

    fieldsets = BaseUserAdmin.fieldsets + (
        ('MindSaathi', {
            'fields': ('role', 'phone', 'date_of_birth', 'gender', 'address', 'preferred_language'),
        }),
    )

    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('MindSaathi', {
            'fields': ('role', 'first_name', 'last_name', 'email', 'phone'),
        }),
    )
