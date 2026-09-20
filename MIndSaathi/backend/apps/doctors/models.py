from django.conf import settings
from django.db import models


class DoctorProfile(models.Model):
    """Extended profile for doctors."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='doctor_profile',
    )
    medical_registration_number = models.CharField(
        max_length=50,
        unique=True,
    )
    specialization = models.CharField(max_length=100, blank=True)
    hospital = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'doctor_profiles'

    def __str__(self):
        return f'Dr. {self.user.get_full_name()} ({self.specialization})'


class DoctorPatient(models.Model):
    """Explicit relationship between doctors and patients."""

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        ACTIVE = 'ACTIVE', 'Active'
        REJECTED = 'REJECTED', 'Rejected'

    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='doctor_patient_links',
        limit_choices_to={'role': 'DOCTOR'},
    )
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='patient_doctor_links',
        limit_choices_to={'role': 'PATIENT'},
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'doctor_patients'
        constraints = [
            models.UniqueConstraint(
                fields=['doctor', 'patient'],
                name='unique_doctor_patient',
            ),
        ]

    def __str__(self):
        return f'Dr. {self.doctor.get_full_name()} → {self.patient.get_full_name()} ({self.status})'
