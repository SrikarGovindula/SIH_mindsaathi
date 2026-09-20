from rest_framework import serializers
from .models import CaretakerNote, DoctorNote


class CaretakerNoteSerializer(serializers.ModelSerializer):
    caretaker_name = serializers.CharField(source='caretaker.get_full_name', read_only=True)
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)

    class Meta:
        model = CaretakerNote
        fields = [
            'id', 'caretaker', 'caretaker_name', 'patient', 'patient_name',
            'note', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'caretaker', 'caretaker_name', 'patient', 'patient_name', 'created_at', 'updated_at']


class DoctorNoteSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='doctor.get_full_name', read_only=True)
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)

    class Meta:
        model = DoctorNote
        fields = [
            'id', 'doctor', 'doctor_name', 'patient', 'patient_name',
            'note', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'doctor', 'doctor_name', 'patient', 'patient_name', 'created_at', 'updated_at']
