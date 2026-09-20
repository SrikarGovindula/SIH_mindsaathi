from django.contrib import admin

from apps.notes.models import CaretakerNote, DoctorNote


@admin.register(CaretakerNote)
class CaretakerNoteAdmin(admin.ModelAdmin):
    list_display = ("caretaker", "patient", "created_at")
    search_fields = ("caretaker__username", "patient__username")


@admin.register(DoctorNote)
class DoctorNoteAdmin(admin.ModelAdmin):
    list_display = ("doctor", "patient", "created_at")
    search_fields = ("doctor__username", "patient__username")
