from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from apps.patients.models import PatientProfile
from apps.doctors.models import DoctorProfile
from apps.caretakers.models import CaretakerProfile, CaretakerInvitation, PatientCaretaker

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'role',
            'phone', 'date_of_birth', 'gender', 'address', 'preferred_language',
        ]


class PatientRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True, required=False, allow_blank=True)
    emergency_contact_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    emergency_contact_phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    caretaker_relationship = serializers.CharField(max_length=50, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'username', 'first_name', 'last_name', 'date_of_birth', 'gender',
            'phone', 'email', 'address', 'preferred_language', 'password',
            'password_confirm', 'emergency_contact_name', 'emergency_contact_phone',
            'caretaker_relationship',
        ]
        extra_kwargs = {
            'email': {'required': False, 'allow_blank': True},
            'phone': {'required': False, 'allow_blank': True},
            'address': {'required': False, 'allow_blank': True},
            'date_of_birth': {'required': False, 'allow_null': True},
            'gender': {'required': False, 'allow_blank': True},
        }

    def validate(self, data):
        pwd = data.get('password')
        pwd_confirm = data.get('password_confirm')
        if pwd_confirm and pwd != pwd_confirm:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})

        username = data.get('username')
        if username and User.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError({'username': 'This username is already taken. Please choose another.'})

        return data

    @transaction.atomic
    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.pop('password_confirm', None)
        emergency_contact_name = validated_data.pop('emergency_contact_name', '')
        emergency_contact_phone = validated_data.pop('emergency_contact_phone', '')
        caretaker_relationship = validated_data.pop('caretaker_relationship', '')

        user = User.objects.create_user(
            password=password,
            role='PATIENT',
            **validated_data,
        )

        PatientProfile.objects.create(
            user=user,
            emergency_contact_name=emergency_contact_name,
            emergency_contact_phone=emergency_contact_phone,
        )

        if caretaker_relationship:
            CaretakerInvitation.objects.create(
                patient=user,
                relationship=caretaker_relationship,
                expires_at=timezone.now() + timezone.timedelta(days=7),
            )

        return user


class DoctorRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True, required=False, allow_blank=True)
    medical_registration_number = serializers.CharField(max_length=255, required=False, allow_blank=True)
    medical_license_number = serializers.CharField(max_length=255, required=False, allow_blank=True)
    specialization = serializers.CharField(max_length=255, required=False, allow_blank=True)
    hospital = serializers.CharField(max_length=255, required=False, allow_blank=True)
    hospital_affiliation = serializers.CharField(max_length=255, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'username', 'first_name', 'last_name', 'phone', 'email',
            'password', 'password_confirm', 'medical_registration_number',
            'medical_license_number', 'specialization', 'hospital', 'hospital_affiliation',
        ]
        extra_kwargs = {
            'email': {'required': False, 'allow_blank': True},
            'phone': {'required': False, 'allow_blank': True},
            'first_name': {'required': False, 'allow_blank': True},
            'last_name': {'required': False, 'allow_blank': True},
        }

    def validate(self, data):
        pwd = data.get('password')
        pwd_confirm = data.get('password_confirm')
        if pwd_confirm and pwd != pwd_confirm:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})

        username = data.get('username')
        if username and User.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError({'username': 'This username is already taken. Please choose another.'})

        med_reg = (
            data.get('medical_registration_number', '').strip()
            or data.get('medical_license_number', '').strip()
        )
        if med_reg and DoctorProfile.objects.filter(medical_registration_number__iexact=med_reg).exists():
            raise serializers.ValidationError({
                'medical_registration_number': 'A clinician with this license/registration number is already registered.'
            })

        return data

    @transaction.atomic
    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.pop('password_confirm', None)
        med_reg = (
            validated_data.pop('medical_registration_number', None)
            or validated_data.pop('medical_license_number', None)
            or f'MED-{timezone.now().strftime("%Y%m%d%H%M%S")}'
        )
        specialization = validated_data.pop('specialization', 'General Practitioner')
        hospital = (
            validated_data.pop('hospital', None)
            or validated_data.pop('hospital_affiliation', '')
        )

        user = User.objects.create_user(
            password=password,
            role='DOCTOR',
            **validated_data,
        )

        DoctorProfile.objects.create(
            user=user,
            medical_registration_number=med_reg,
            specialization=specialization,
            hospital=hospital,
        )
        return user


class CaretakerActivationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True, required=False, allow_blank=True)
    invitation_code = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'username', 'first_name', 'last_name', 'phone', 'email',
            'password', 'password_confirm', 'invitation_code',
        ]
        extra_kwargs = {
            'first_name': {'required': False, 'allow_blank': True},
            'last_name': {'required': False, 'allow_blank': True},
            'phone': {'required': False, 'allow_blank': True},
            'email': {'required': False, 'allow_blank': True},
        }

    def validate(self, data):
        pwd = data.get('password')
        pwd_confirm = data.get('password_confirm')
        if pwd_confirm and pwd != pwd_confirm:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})

        username = data.get('username')
        if username and User.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError({'username': 'This username is already taken. Please choose another.'})

        raw_code = data.get('invitation_code', '').strip().upper()
        if not raw_code:
            raise serializers.ValidationError({'invitation_code': 'Invitation code is required.'})

        try:
            invitation = CaretakerInvitation.objects.get(code__iexact=raw_code)
            if invitation.status == 'ACCEPTED':
                raise serializers.ValidationError({'invitation_code': 'This invitation code has already been used.'})
            if invitation.status == 'EXPIRED' or invitation.is_expired:
                raise serializers.ValidationError({'invitation_code': 'This invitation code has expired.'})
            self.context['invitation'] = invitation
        except CaretakerInvitation.DoesNotExist:
            raise serializers.ValidationError({'invitation_code': 'Invalid invitation code. Please check with the patient.'})

        return data

    @transaction.atomic
    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.pop('password_confirm', None)
        validated_data.pop('invitation_code')

        invitation = self.context['invitation']

        user = User.objects.create_user(
            password=password,
            role='CARETAKER',
            **validated_data,
        )

        CaretakerProfile.objects.create(user=user)

        PatientCaretaker.objects.create(
            patient=invitation.patient,
            caretaker=user,
            relationship=invitation.relationship or 'Caregiver',
            is_primary=False,
        )

        invitation.status = 'ACCEPTED'
        invitation.accepted_by = user
        invitation.save()

        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'role': self.user.role,
            'full_name': f'{self.user.first_name} {self.user.last_name}'.strip() or self.user.username,
            'username': self.user.username,
            'email': self.user.email,
        }
        return data
