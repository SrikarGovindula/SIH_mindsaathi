from django.conf import settings
from django.db import models


class CaretakerNote(models.Model):
    """Observation note by a caretaker about a patient."""

    caretaker = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='caretaker_notes',
        limit_choices_to={'role': 'CARETAKER'},
    )
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='caretaker_notes_about',
        limit_choices_to={'role': 'PATIENT'},
    )
    note = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'caretaker_notes'
        ordering = ['-created_at']

    def __str__(self):
        return f'Note by {self.caretaker.get_full_name()} about {self.patient.get_full_name()}'


class DoctorNote(models.Model):
    """Clinical note by a doctor about a patient."""

    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='doctor_notes',
        limit_choices_to={'role': 'DOCTOR'},
    )
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='doctor_notes_about',
        limit_choices_to={'role': 'PATIENT'},
    )
    note = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'doctor_notes'
        ordering = ['-created_at']

    def __str__(self):
        return f'Note by Dr. {self.doctor.get_full_name()} about {self.patient.get_full_name()}'
