from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.contrib.auth import get_user_model

from .models import CaretakerProfile, CaretakerInvitation, PatientCaretaker
from .serializers import (
    CaretakerInvitationSerializer, PatientCaretakerSerializer,
)
from apps.accounts.permissions import IsCaretaker, IsPatient
from apps.accounts.serializers import UserSerializer
from apps.games.models import GameSession

User = get_user_model()


class CaretakerProfileView(APIView):
    permission_classes = [IsCaretaker]

    def get(self, request):
        user = request.user
        data = UserSerializer(user).data
        return Response(data)

    def put(self, request):
        user = request.user
        for field in ('first_name', 'last_name', 'phone', 'email'):
            if field in request.data:
                setattr(user, field, request.data[field])
        user.save()
        return Response(UserSerializer(user).data)


class CreateInvitationView(APIView):
    permission_classes = [IsPatient]

    def post(self, request):
        relationship = request.data.get('relationship', 'Family')

        invitation = CaretakerInvitation(
            patient=request.user,
            relationship=relationship,
            expires_at=timezone.now() + timezone.timedelta(days=7),
        )
        invitation.save()

        serializer = CaretakerInvitationSerializer(invitation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ListInvitationsView(APIView):
    permission_classes = [IsPatient]

    def get(self, request):
        invitations = CaretakerInvitation.objects.filter(patient=request.user)
        serializer = CaretakerInvitationSerializer(invitations, many=True)
        return Response(serializer.data)


class ManageCaretakersView(APIView):
    permission_classes = [IsPatient]

    def get(self, request):
        links = PatientCaretaker.objects.filter(
            patient=request.user,
        ).select_related('caretaker')
        serializer = PatientCaretakerSerializer(links, many=True)
        return Response(serializer.data)

    def delete(self, request, pk):
        link = get_object_or_404(
            PatientCaretaker, pk=pk, patient=request.user,
        )
        link.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def patch(self, request, pk):
        link = get_object_or_404(
            PatientCaretaker, pk=pk, patient=request.user,
        )
        is_primary = request.data.get('is_primary')
        if is_primary is not None:
            if is_primary:
                # Unset all other primaries for this patient
                PatientCaretaker.objects.filter(
                    patient=request.user,
                ).update(is_primary=False)
            link.is_primary = is_primary
            link.save()
        serializer = PatientCaretakerSerializer(link)
        return Response(serializer.data)


class CaretakerPatientsView(APIView):
    permission_classes = [IsCaretaker]

    def get(self, request):
        links = PatientCaretaker.objects.filter(
            caretaker=request.user,
        ).select_related('patient')

        patients_data = []
        for link in links:
            patient = link.patient
            last_session = (
                GameSession.objects.filter(patient=patient, completed=True)
                .order_by('-completed_at')
                .first()
            )
            patients_data.append({
                'id': patient.id,
                'name': patient.get_full_name(),
                'relationship': link.relationship,
                'is_primary': link.is_primary,
                'last_activity': last_session.completed_at if last_session else None,
                'last_score': float(last_session.score) if last_session else None,
                'link_id': link.id,
            })
        return Response(patients_data)


class CaretakerPatientDetailView(APIView):
    permission_classes = [IsCaretaker]

    def get(self, request, patient_id):
        link = get_object_or_404(
            PatientCaretaker,
            caretaker=request.user,
            patient__id=patient_id,
        )
        patient = link.patient

        recent_sessions = (
            GameSession.objects.filter(patient=patient, completed=True)
            .select_related('game', 'level')
            .order_by('-completed_at')[:10]
        )
        sessions_data = [
            {
                'game': s.game.name,
                'game_type': s.game.game_type,
                'level': s.level.level_number,
                'score': float(s.score),
                'accuracy': float(s.accuracy),
                'completed_at': s.completed_at,
            }
            for s in recent_sessions
        ]

        # Get patient profile info if available
        profile_data = {}
        if hasattr(patient, 'patient_profile'):
            profile = patient.patient_profile
            profile_data = {
                'emergency_contact_name': profile.emergency_contact_name,
                'emergency_contact_phone': profile.emergency_contact_phone,
            }

        return Response({
            'patient_id': patient.id,
            'patient_name': patient.get_full_name(),
            'relationship': link.relationship,
            'is_primary': link.is_primary,
            'recent_sessions': sessions_data,
            **profile_data,
        })
