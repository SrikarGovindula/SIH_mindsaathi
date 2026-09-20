import secrets
import string

from django.conf import settings
from django.db import models
from django.utils import timezone


class CaretakerProfile(models.Model):
    """Extended profile for caretakers."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='caretaker_profile',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'caretaker_profiles'

    def __str__(self):
        return f'Caretaker: {self.user.get_full_name()}'


class CaretakerInvitation(models.Model):
    """Invitation for a caretaker to join a patient."""

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        ACCEPTED = 'ACCEPTED', 'Accepted'
        EXPIRED = 'EXPIRED', 'Expired'

    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='caretaker_invitations',
        limit_choices_to={'role': 'PATIENT'},
    )
    code = models.CharField(max_length=8, unique=True, editable=False)
    relationship = models.CharField(
        max_length=50,
        blank=True,
        help_text='e.g., Son, Daughter, Spouse, Nurse',
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    accepted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='accepted_invitations',
    )

    class Meta:
        db_table = 'caretaker_invitations'

    def __str__(self):
        return f'Invitation {self.code} for {self.patient.get_full_name()}'

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = self._generate_code()
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(days=7)
        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at

    @property
    def is_valid(self):
        return self.status == self.Status.PENDING and not self.is_expired

    @staticmethod
    def _generate_code():
        chars = string.ascii_uppercase + string.digits
        while True:
            code = ''.join(secrets.choice(chars) for _ in range(8))
            if not CaretakerInvitation.objects.filter(code=code).exists():
                return code


class PatientCaretaker(models.Model):
    """Explicit many-to-many relationship between patients and caretakers."""

    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='caretaker_links',
        limit_choices_to={'role': 'PATIENT'},
    )
    caretaker = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='patient_links',
        limit_choices_to={'role': 'CARETAKER'},
    )
    relationship = models.CharField(max_length=50, blank=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'patient_caretakers'
        constraints = [
            models.UniqueConstraint(
                fields=['patient', 'caretaker'],
                name='unique_patient_caretaker',
            ),
        ]

    def __str__(self):
        primary = ' (Primary)' if self.is_primary else ''
        return f'{self.caretaker.get_full_name()} → {self.patient.get_full_name()}{primary}'
