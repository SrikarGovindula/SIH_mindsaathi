from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Avg, Count
from django.contrib.auth import get_user_model
from django.core.exceptions import PermissionDenied

from apps.games.models import GameSession
from apps.caretakers.models import PatientCaretaker
from apps.doctors.models import DoctorPatient
from apps.games.serializers import GameSessionSerializer

User = get_user_model()


def get_authorized_patient_user(request):
    """
    Return the patient User object. If the requester is a patient,
    returns themselves. If doctor/caretaker, requires patient_id param
    and validates the relationship.
    """
    user = request.user

    if user.role == 'PATIENT':
        return user

    patient_id = request.query_params.get('patient_id')
    if not patient_id:
        raise PermissionDenied('patient_id query parameter is required.')

    patient_user = get_object_or_404(User, id=patient_id, role='PATIENT')

    if user.role == 'CARETAKER':
        if not PatientCaretaker.objects.filter(
            caretaker=user, patient=patient_user,
        ).exists():
            raise PermissionDenied('Not authorized to view this patient.')
        return patient_user

    if user.role == 'DOCTOR':
        if not DoctorPatient.objects.filter(
            doctor=user, patient=patient_user, status='ACTIVE',
        ).exists():
            raise PermissionDenied('Not authorized to view this patient.')
        return patient_user

    raise PermissionDenied('Unauthorized.')


class ProgressSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        patient_user = get_authorized_patient_user(request)

        sessions = GameSession.objects.filter(patient=patient_user, completed=True)

        sessions_count = sessions.count()
        games_completed = sessions.values('game').distinct().count()
        overall_average = sessions.aggregate(avg=Avg('score'))['avg'] or 0

        memory_avg = (
            sessions.filter(game__game_type='MEMORY_MATCH')
            .aggregate(avg=Avg('score'))['avg'] or 0
        )
        pattern_avg = (
            sessions.filter(game__game_type='PATTERN_SEQUENCE')
            .aggregate(avg=Avg('score'))['avg'] or 0
        )
        recall_avg = (
            sessions.filter(game__game_type='DAILY_RECALL')
            .aggregate(avg=Avg('score'))['avg'] or 0
        )

        return Response({
            'games_completed': games_completed,
            'sessions_count': sessions_count,
            'overall_average_score': round(float(overall_average), 2),
            'memory_average': round(float(memory_avg), 2),
            'pattern_average': round(float(pattern_avg), 2),
            'recall_average': round(float(recall_avg), 2),
        })


class ProgressHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        patient_user = get_authorized_patient_user(request)
        sessions = GameSession.objects.filter(
            patient=patient_user, completed=True,
        ).order_by('-completed_at')

        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        start = (page - 1) * page_size
        end = start + page_size

        serializer = GameSessionSerializer(sessions[start:end], many=True)
        return Response({
            'count': sessions.count(),
            'page': page,
            'results': serializer.data,
        })


class ActivityTimelineView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        patient_user = get_authorized_patient_user(request)
        recent_sessions = (
            GameSession.objects.filter(patient=patient_user, completed=True)
            .select_related('game', 'level')
            .order_by('-completed_at')[:30]
        )

        events = []
        for s in recent_sessions:
            events.append({
                'id': s.id,
                'game_name': s.game.name,
                'game_type': s.game.game_type,
                'score': float(s.score),
                'accuracy': float(s.accuracy),
                'level_number': s.level.level_number,
                'completed_at': s.completed_at,
            })

        return Response(events)
