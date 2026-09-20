from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.db.models import Max

from .models import PatientProfile, Reminder, CaregiverAlert
from .serializers import (
    PatientProfileSerializer, ReminderSerializer, CaregiverAlertSerializer,
)
from apps.accounts.permissions import IsPatient, IsCaretaker, IsDoctor
from apps.games.models import GameSession
from apps.caretakers.models import PatientCaretaker
from apps.doctors.models import DoctorPatient

User = get_user_model()


class PatientProfileView(APIView):
    permission_classes = [IsPatient]

    def get(self, request):
        profile, _ = PatientProfile.objects.get_or_create(user=request.user)
        serializer = PatientProfileSerializer(profile)
        data = serializer.data
        data['first_name'] = request.user.first_name
        data['last_name'] = request.user.last_name
        data['email'] = request.user.email
        data['phone'] = request.user.phone
        data['date_of_birth'] = request.user.date_of_birth
        data['gender'] = request.user.gender
        data['address'] = request.user.address
        data['preferred_language'] = request.user.preferred_language
        return Response(data)

    def put(self, request):
        profile, _ = PatientProfile.objects.get_or_create(user=request.user)
        serializer = PatientProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            user = request.user
            for field in ('first_name', 'last_name', 'email', 'phone', 'address', 'preferred_language'):
                if field in request.data:
                    setattr(user, field, request.data[field])
            user.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PatientDashboardView(APIView):
    permission_classes = [IsPatient]

    def get(self, request):
        user = request.user
        today = timezone.now().date()

        today_sessions = GameSession.objects.filter(
            patient=user, completed=True,
            completed_at__date=today,
        ).count()

        total_games_completed = GameSession.objects.filter(
            patient=user, completed=True,
        ).count()

        recent_sessions_qs = (
            GameSession.objects.filter(patient=user, completed=True)
            .select_related('game', 'level')
            .order_by('-completed_at')[:5]
        )

        recent_sessions = []
        for session in recent_sessions_qs:
            recent_sessions.append({
                'id': session.id,
                'game': session.game.name,
                'game_type': session.game.game_type,
                'level': session.level.level_number,
                'score': float(session.score),
                'accuracy': float(session.accuracy),
                'completed_at': session.completed_at,
            })

        current_levels = dict(
            GameSession.objects.filter(patient=user, completed=True)
            .values_list('game__name')
            .annotate(highest_level=Max('level__level_number'))
        )

        # Today's active reminders count
        reminders_count = Reminder.objects.filter(patient=user, is_active=True).count()
        completed_reminders_count = Reminder.objects.filter(
            patient=user, is_active=True, is_completed_today=True,
        ).count()

        return Response({
            'patient_name': user.get_full_name(),
            'today_sessions': today_sessions,
            'total_games_completed': total_games_completed,
            'recent_sessions': recent_sessions,
            'current_levels': current_levels,
            'reminders_total': reminders_count,
            'reminders_completed': completed_reminders_count,
        })


class ReminderListCreateView(APIView):
    """
    Patient or linked Caretaker manages daily medicine, hydration, routine & appointment reminders.
    """

    permission_classes = [IsAuthenticated]

    def get_patient_user(self, request):
        user = request.user
        if user.role == 'PATIENT':
            return user
        patient_id = request.query_params.get('patient_id')
        if not patient_id:
            return None
        patient_user = get_object_or_404(User, id=patient_id, role='PATIENT')
        if user.role == 'CARETAKER':
            if not PatientCaretaker.objects.filter(caretaker=user, patient=patient_user).exists():
                return None
        return patient_user

    def get(self, request):
        patient_user = self.get_patient_user(request)
        if not patient_user:
            return Response({'error': 'Unauthorized or patient not specified'}, status=status.HTTP_403_FORBIDDEN)

        reminders = Reminder.objects.filter(patient=patient_user, is_active=True).order_by('time')
        serializer = ReminderSerializer(reminders, many=True)
        return Response(serializer.data)

    def post(self, request):
        patient_user = self.get_patient_user(request)
        if not patient_user:
            return Response({'error': 'Unauthorized or patient not specified'}, status=status.HTTP_403_FORBIDDEN)

        serializer = ReminderSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(patient=patient_user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReminderToggleCompleteView(APIView):
    """Toggle completed status for a reminder."""

    permission_classes = [IsAuthenticated]

    def patch(self, request, reminder_id):
        reminder = get_object_or_404(Reminder, id=reminder_id)
        # Verify ownership or linked caretaker
        user = request.user
        if user != reminder.patient:
            if not PatientCaretaker.objects.filter(caretaker=user, patient=reminder.patient).exists():
                return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        is_completed = request.data.get('is_completed_today', not reminder.is_completed_today)
        reminder.is_completed_today = is_completed
        reminder.save()
        return Response(ReminderSerializer(reminder).data)

    def delete(self, request, reminder_id):
        reminder = get_object_or_404(Reminder, id=reminder_id)
        user = request.user
        if user != reminder.patient:
            if not PatientCaretaker.objects.filter(caretaker=user, patient=reminder.patient).exists():
                return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        reminder.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CaregiverAlertListView(APIView):
    """
    Caregivers and doctors view intelligent alerts (inactivity, cognitive fatigue, missed meds).
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == 'CARETAKER':
            patient_ids = PatientCaretaker.objects.filter(caretaker=user).values_list('patient_id', flat=True)
            alerts = CaregiverAlert.objects.filter(patient_id__in=patient_ids, is_resolved=False)
        elif user.role == 'DOCTOR':
            patient_ids = DoctorPatient.objects.filter(doctor=user, status='ACTIVE').values_list('patient_id', flat=True)
            alerts = CaregiverAlert.objects.filter(patient_id__in=patient_ids, is_resolved=False)
        elif user.role == 'PATIENT':
            alerts = CaregiverAlert.objects.filter(patient=user, is_resolved=False)
        else:
            alerts = CaregiverAlert.objects.none()

        serializer = CaregiverAlertSerializer(alerts[:30], many=True)
        return Response(serializer.data)


class CaregiverAlertResolveView(APIView):
    """Resolve an alert."""

    permission_classes = [IsAuthenticated]

    def patch(self, request, alert_id):
        alert = get_object_or_404(CaregiverAlert, id=alert_id)
        alert.is_resolved = True
        alert.save()
        return Response({'message': 'Alert marked as resolved.'})
