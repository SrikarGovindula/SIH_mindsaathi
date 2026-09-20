from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from apps.caretakers.models import CaretakerInvitation, PatientCaretaker, CaretakerProfile
from apps.patients.models import PatientProfile
from apps.doctors.models import DoctorProfile, DoctorPatient

User = get_user_model()


class CaretakerRelationshipTests(TestCase):
    """Tests for caretaker invitation and linking flow."""

    def setUp(self):
        self.client = APIClient()
        self.patient = User.objects.create_user(
            username='rel_patient', password='TestPass123!',
            role='PATIENT', first_name='Rel', last_name='Patient',
        )
        PatientProfile.objects.create(user=self.patient)

    def test_create_invitation(self):
        self.client.force_authenticate(user=self.patient)
        response = self.client.post('/api/caretakers/invitations/create/', {
            'relationship': 'Son',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('code', response.data)
        self.assertEqual(len(response.data['code']), 8)

    def test_caretaker_activation_with_code(self):
        # Create an invitation
        self.client.force_authenticate(user=self.patient)
        inv_resp = self.client.post('/api/caretakers/invitations/create/', {
            'relationship': 'Daughter',
        }, format='json')
        code = inv_resp.data['code']

        # Activate caretaker
        self.client.force_authenticate(user=None)
        response = self.client.post('/api/auth/register/caretaker/', {
            'invitation_code': code,
            'username': 'caretaker1',
            'password': 'TestPass123!',
            'password_confirm': 'TestPass123!',
            'first_name': 'Care',
            'last_name': 'Taker',
            'phone': '5551234567',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['user']['role'], 'CARETAKER')

        # Verify link was created
        caretaker = User.objects.get(username='caretaker1')
        self.assertTrue(
            PatientCaretaker.objects.filter(
                patient=self.patient, caretaker=caretaker,
            ).exists()
        )

    def test_invalid_invitation_code(self):
        response = self.client.post('/api/auth/register/caretaker/', {
            'invitation_code': 'INVALID1',
            'username': 'caretaker_bad',
            'password': 'TestPass123!',
            'password_confirm': 'TestPass123!',
            'first_name': 'Bad',
            'last_name': 'Code',
            'phone': '5559999999',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_manage_caretakers_list(self):
        caretaker = User.objects.create_user(
            username='ct_list', password='TestPass123!',
            role='CARETAKER', first_name='List', last_name='CT',
        )
        PatientCaretaker.objects.create(
            patient=self.patient, caretaker=caretaker, relationship='Nurse',
        )
        self.client.force_authenticate(user=self.patient)
        response = self.client.get('/api/caretakers/manage/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_set_primary_caretaker(self):
        caretaker = User.objects.create_user(
            username='ct_primary', password='TestPass123!',
            role='CARETAKER', first_name='Primary', last_name='CT',
        )
        link = PatientCaretaker.objects.create(
            patient=self.patient, caretaker=caretaker, relationship='Spouse',
        )
        self.client.force_authenticate(user=self.patient)
        response = self.client.patch(
            f'/api/caretakers/manage/{link.id}/',
            {'is_primary': True},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        link.refresh_from_db()
        self.assertTrue(link.is_primary)


class DoctorPatientRelationshipTests(TestCase):
    """Tests for doctor-patient linking."""

    def setUp(self):
        self.client = APIClient()
        self.patient = User.objects.create_user(
            username='dp_patient', password='TestPass123!',
            role='PATIENT', first_name='DP', last_name='Patient',
        )
        PatientProfile.objects.create(user=self.patient)
        self.doctor = User.objects.create_user(
            username='dp_doctor', password='TestPass123!',
            role='DOCTOR', first_name='DP', last_name='Doctor',
        )
        DoctorProfile.objects.create(
            user=self.doctor, medical_registration_number='DOC001',
        )

    def test_doctor_sends_connection_request(self):
        self.client.force_authenticate(user=self.doctor)
        response = self.client.post('/api/doctors/patients/', {
            'username': 'dp_patient',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'PENDING')

    def test_patient_accepts_request(self):
        dp = DoctorPatient.objects.create(
            doctor=self.doctor, patient=self.patient, status='PENDING',
        )
        self.client.force_authenticate(user=self.patient)
        response = self.client.patch('/api/doctors/connection-requests/', {
            'request_id': dp.id,
            'status': 'ACTIVE',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        dp.refresh_from_db()
        self.assertEqual(dp.status, 'ACTIVE')

    def test_doctor_cannot_access_unlinked_patient(self):
        self.client.force_authenticate(user=self.doctor)
        response = self.client.get(f'/api/doctors/patients/{self.patient.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_doctor_can_access_linked_patient(self):
        DoctorPatient.objects.create(
            doctor=self.doctor, patient=self.patient, status='ACTIVE',
        )
        self.client.force_authenticate(user=self.doctor)
        response = self.client.get(f'/api/doctors/patients/{self.patient.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_caretaker_cannot_access_unlinked_patient(self):
        caretaker = User.objects.create_user(
            username='unlinked_ct', password='TestPass123!',
            role='CARETAKER',
        )
        self.client.force_authenticate(user=caretaker)
        response = self.client.get(f'/api/caretakers/patients/{self.patient.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
