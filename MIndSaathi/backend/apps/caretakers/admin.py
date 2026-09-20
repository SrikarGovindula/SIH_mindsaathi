from django.contrib import admin

from apps.caretakers.models import CaretakerInvitation, CaretakerProfile, PatientCaretaker


@admin.register(CaretakerProfile)
class CaretakerProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "created_at")


@admin.register(CaretakerInvitation)
class CaretakerInvitationAdmin(admin.ModelAdmin):
    list_display = ("code", "patient", "status", "created_at", "expires_at")
    list_filter = ("status",)
    readonly_fields = ("code",)


@admin.register(PatientCaretaker)
class PatientCaretakerAdmin(admin.ModelAdmin):
    list_display = ("patient", "caretaker", "relationship", "is_primary", "created_at")
    list_filter = ("is_primary",)
