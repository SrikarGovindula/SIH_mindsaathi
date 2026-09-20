from rest_framework import serializers
from .models import CaretakerInvitation, PatientCaretaker


class CaretakerInvitationSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)

    class Meta:
        model = CaretakerInvitation
        fields = [
            'id', 'patient', 'patient_name', 'code', 'relationship',
            'status', 'created_at', 'expires_at',
        ]
        read_only_fields = [
            'id', 'patient', 'patient_name', 'code', 'status',
            'created_at', 'expires_at',
        ]


class PatientCaretakerSerializer(serializers.ModelSerializer):
    caretaker_name = serializers.CharField(source='caretaker.get_full_name', read_only=True)
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)

    class Meta:
        model = PatientCaretaker
        fields = [
            'id', 'patient', 'patient_name', 'caretaker', 'caretaker_name',
            'relationship', 'is_primary', 'created_at',
        ]
