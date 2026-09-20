from rest_framework import serializers
from .models import PatientProfile, Reminder, CaregiverAlert


class PatientProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientProfile
        fields = [
            'id', 'emergency_contact_name', 'emergency_contact_phone',
            'medical_notes', 'regional_language_preference',
        ]


class ReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reminder
        fields = [
            'id', 'patient', 'title', 'reminder_type', 'time',
            'frequency', 'notes', 'is_completed_today', 'is_active',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'patient', 'created_at', 'updated_at']


class CaregiverAlertSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)

    class Meta:
        model = CaregiverAlert
        fields = [
            'id', 'patient', 'patient_name', 'title', 'message',
            'alert_type', 'severity', 'is_resolved', 'created_at',
        ]
        read_only_fields = ['id', 'patient', 'patient_name', 'created_at']
