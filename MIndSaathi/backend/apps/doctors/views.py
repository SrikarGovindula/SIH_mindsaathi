from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Avg

from .models import DoctorProfile, DoctorPatient
from .serializers import DoctorProfileSerializer
from apps.accounts.permissions import IsDoctor, IsPatient
from apps.accounts.serializers import UserSerializer
from apps.games.models import GameSession
from apps.notes.models import CaretakerNote, DoctorNote

User = get_user_model()


class DoctorProfileView(APIView):
    permission_classes = [IsDoctor]

    def get(self, request):
        profile = request.user.doctor_profile
        serializer = DoctorProfileSerializer(profile)
        data = serializer.data
        data['first_name'] = request.user.first_name
        data['last_name'] = request.user.last_name
        data['email'] = request.user.email
        data['phone'] = request.user.phone
        return Response(data)

    def put(self, request):
        profile = request.user.doctor_profile
        serializer = DoctorProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            user = request.user
            for field in ('first_name', 'last_name', 'phone', 'email'):
                if field in request.data:
                    setattr(user, field, request.data[field])
            user.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DoctorPatientsView(APIView):
    permission_classes = [IsDoctor]

    def get(self, request):
        links = DoctorPatient.objects.filter(
            doctor=request.user, status='ACTIVE',
        ).select_related('patient')

        patients_data = []
        for link in links:
            patient = link.patient
            last_session = (
                GameSession.objects.filter(patient=patient, completed=True)
                .order_by('-completed_at')
                .first()
            )
            # Per-game averages
            memory_avg = (
                GameSession.objects.filter(
                    patient=patient, completed=True, game__game_type='MEMORY_MATCH',
                ).aggregate(avg=Avg('score'))['avg'] or 0
            )
            pattern_avg = (
                GameSession.objects.filter(
                    patient=patient, completed=True, game__game_type='PATTERN_SEQUENCE',
                ).aggregate(avg=Avg('score'))['avg'] or 0
            )
            recall_avg = (
                GameSession.objects.filter(
                    patient=patient, completed=True, game__game_type='DAILY_RECALL',
                ).aggregate(avg=Avg('score'))['avg'] or 0
            )

            patients_data.append({
                'id': patient.id,
                'name': patient.get_full_name(),
                'username': patient.username,
                'last_activity': last_session.completed_at if last_session else None,
                'memory_avg': round(float(memory_avg), 1),
                'pattern_avg': round(float(pattern_avg), 1),
                'recall_avg': round(float(recall_avg), 1),
                'link_id': link.id,
            })
        return Response(patients_data)

    def post(self, request):
        username = request.data.get('username')
        patient_id = request.data.get('patient_id')

        if username:
            patient_user = get_object_or_404(User, username=username, role='PATIENT')
        elif patient_id:
            patient_user = get_object_or_404(User, id=patient_id, role='PATIENT')
        else:
            return Response(
                {'error': 'Provide username or patient_id'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        dp, created = DoctorPatient.objects.get_or_create(
            doctor=request.user,
            patient=patient_user,
            defaults={'status': 'PENDING'},
        )
        if not created and dp.status == 'REJECTED':
            dp.status = 'PENDING'
            dp.save()

        return Response(
            {'message': 'Connection request sent', 'status': dp.status},
            status=status.HTTP_201_CREATED,
        )


class DoctorPatientDetailView(APIView):
    permission_classes = [IsDoctor]

    def get(self, request, patient_id):
        dp = get_object_or_404(
            DoctorPatient,
            doctor=request.user,
            patient__id=patient_id,
            status='ACTIVE',
        )
        patient = dp.patient

        recent_sessions = (
            GameSession.objects.filter(patient=patient, completed=True)
            .select_related('game', 'level')
            .order_by('-completed_at')[:10]
        )
        sessions_data = [
            {
                'id': s.id,
                'game': s.game.name,
                'game_type': s.game.game_type,
                'level': s.level.level_number,
                'score': float(s.score),
                'accuracy': float(s.accuracy),
                'completed_at': s.completed_at,
            }
            for s in recent_sessions
        ]

        # Get caretaker observations
        caretaker_notes = CaretakerNote.objects.filter(
            patient=patient,
        ).order_by('-created_at')[:10]
        caretaker_notes_data = [
            {
                'id': n.id,
                'caretaker': n.caretaker.get_full_name(),
                'note': n.note,
                'created_at': n.created_at,
            }
            for n in caretaker_notes
        ]

        # Get doctor's own notes
        doctor_notes = DoctorNote.objects.filter(
            doctor=request.user, patient=patient,
        ).order_by('-created_at')[:10]
        doctor_notes_data = [
            {
                'id': n.id,
                'note': n.note,
                'created_at': n.created_at,
            }
            for n in doctor_notes
        ]

        profile_data = {}
        if hasattr(patient, 'patient_profile'):
            p = patient.patient_profile
            profile_data = {
                'emergency_contact_name': p.emergency_contact_name,
                'emergency_contact_phone': p.emergency_contact_phone,
            }

        return Response({
            'patient_id': patient.id,
            'patient_name': patient.get_full_name(),
            'email': patient.email,
            'phone': patient.phone,
            'date_of_birth': patient.date_of_birth,
            'gender': patient.gender,
            'recent_sessions': sessions_data,
            'caretaker_observations': caretaker_notes_data,
            'doctor_notes': doctor_notes_data,
            **profile_data,
        })


class PatientConnectionRequestsView(APIView):
    permission_classes = [IsPatient]

    def get(self, request):
        requests_qs = DoctorPatient.objects.filter(
            patient=request.user, status='PENDING',
        ).select_related('doctor')

        data = []
        for req in requests_qs:
            doctor = req.doctor
            profile_data = {}
            if hasattr(doctor, 'doctor_profile'):
                profile_data = {
                    'hospital': doctor.doctor_profile.hospital,
                    'specialization': doctor.doctor_profile.specialization,
                }
            data.append({
                'request_id': req.id,
                'doctor_id': doctor.id,
                'doctor_name': doctor.get_full_name(),
                'status': req.status,
                **profile_data,
            })
        return Response(data)

    def patch(self, request):
        request_id = request.data.get('request_id')
        new_status = request.data.get('status')

        if new_status not in ('ACTIVE', 'REJECTED'):
            return Response(
                {'error': 'Invalid status. Use ACTIVE or REJECTED.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        dp = get_object_or_404(
            DoctorPatient,
            id=request_id,
            patient=request.user,
            status='PENDING',
        )
        dp.status = new_status
        dp.save()

        return Response({'message': f'Request {new_status.lower()} successfully.'})
