from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.core.exceptions import PermissionDenied
from django.contrib.auth import get_user_model

from .models import CaretakerNote, DoctorNote
from .serializers import CaretakerNoteSerializer, DoctorNoteSerializer
from apps.accounts.permissions import IsCaretaker, IsDoctor
from apps.caretakers.models import PatientCaretaker
from apps.doctors.models import DoctorPatient

User = get_user_model()


def _get_authorized_patient_user(request):
    """Get authorized patient User for notes access."""
    user = request.user
    patient_id = request.query_params.get('patient_id') or request.data.get('patient_id')

    if user.role == 'PATIENT':
        return user

    if not patient_id:
        raise PermissionDenied('patient_id is required.')

    patient_user = get_object_or_404(User, id=patient_id, role='PATIENT')

    if user.role == 'CARETAKER':
        if not PatientCaretaker.objects.filter(
            caretaker=user, patient=patient_user,
        ).exists():
            raise PermissionDenied('Not authorized.')
        return patient_user

    if user.role == 'DOCTOR':
        if not DoctorPatient.objects.filter(
            doctor=user, patient=patient_user, status='ACTIVE',
        ).exists():
            raise PermissionDenied('Not authorized.')
        return patient_user

    raise PermissionDenied('Unauthorized.')


class CaretakerNoteListCreateView(APIView):
    permission_classes = [IsCaretaker]

    def get(self, request):
        patient_user = _get_authorized_patient_user(request)
        notes = CaretakerNote.objects.filter(
            caretaker=request.user, patient=patient_user,
        ).order_by('-created_at')
        serializer = CaretakerNoteSerializer(notes, many=True)
        return Response(serializer.data)

    def post(self, request):
        patient_user = _get_authorized_patient_user(request)
        note_text = request.data.get('note', '')
        if not note_text.strip():
            return Response(
                {'error': 'Note text is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        note = CaretakerNote.objects.create(
            caretaker=request.user,
            patient=patient_user,
            note=note_text,
        )
        serializer = CaretakerNoteSerializer(note)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class DoctorNoteListCreateView(APIView):
    permission_classes = [IsDoctor]

    def get(self, request):
        patient_user = _get_authorized_patient_user(request)
        notes = DoctorNote.objects.filter(
            doctor=request.user, patient=patient_user,
        ).order_by('-created_at')
        serializer = DoctorNoteSerializer(notes, many=True)
        return Response(serializer.data)

    def post(self, request):
        patient_user = _get_authorized_patient_user(request)
        note_text = request.data.get('note', '')
        if not note_text.strip():
            return Response(
                {'error': 'Note text is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        note = DoctorNote.objects.create(
            doctor=request.user,
            patient=patient_user,
            note=note_text,
        )
        serializer = DoctorNoteSerializer(note)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PatientNotesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        patient_user = _get_authorized_patient_user(request)

        caretaker_notes = CaretakerNote.objects.filter(
            patient=patient_user,
        ).order_by('-created_at')
        doctor_notes = DoctorNote.objects.filter(
            patient=patient_user,
        ).order_by('-created_at')

        return Response({
            'caretaker_notes': CaretakerNoteSerializer(caretaker_notes, many=True).data,
            'doctor_notes': DoctorNoteSerializer(doctor_notes, many=True).data,
        })
