from django.contrib import admin

from apps.doctors.models import DoctorPatient, DoctorProfile


@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "medical_registration_number", "specialization", "hospital")
    search_fields = ("user__username", "medical_registration_number")


@admin.register(DoctorPatient)
class DoctorPatientAdmin(admin.ModelAdmin):
    list_display = ("doctor", "patient", "status", "created_at")
    list_filter = ("status",)
