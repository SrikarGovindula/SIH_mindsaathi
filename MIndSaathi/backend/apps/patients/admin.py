from django.contrib import admin

from apps.patients.models import PatientProfile


@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "emergency_contact_name", "emergency_contact_phone", "created_at")
    search_fields = ("user__username", "user__first_name", "user__last_name")
