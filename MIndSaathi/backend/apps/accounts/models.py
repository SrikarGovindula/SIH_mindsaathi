from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    """Custom user manager that uses username for authentication."""

    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError('Username is required')
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.Role.DOCTOR)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(username, password, **extra_fields)


class User(AbstractUser):
    """Custom user model with role-based access."""

    class Role(models.TextChoices):
        PATIENT = 'PATIENT', 'Patient'
        CARETAKER = 'CARETAKER', 'Caretaker'
        DOCTOR = 'DOCTOR', 'Doctor'

    class Gender(models.TextChoices):
        MALE = 'M', 'Male'
        FEMALE = 'F', 'Female'
        OTHER = 'O', 'Other'

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.PATIENT,
    )
    phone = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(
        max_length=1,
        choices=Gender.choices,
        blank=True,
    )
    address = models.TextField(blank=True)
    preferred_language = models.CharField(max_length=50, default='English')

    objects = UserManager()

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f'{self.get_full_name()} ({self.role})'

    @property
    def is_patient(self):
        return self.role == self.Role.PATIENT

    @property
    def is_caretaker(self):
        return self.role == self.Role.CARETAKER

    @property
    def is_doctor(self):
        return self.role == self.Role.DOCTOR
