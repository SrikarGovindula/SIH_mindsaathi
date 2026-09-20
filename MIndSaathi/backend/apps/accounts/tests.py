from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


class AuthenticationTests(TestCase):
    """Tests for authentication endpoints."""

    def setUp(self):
        self.client = APIClient()

    def test_patient_registration(self):
        data = {
            'username': 'patient1',
            'password': 'TestPass123!',
            'password_confirm': 'TestPass123!',
            'first_name': 'Test',
            'last_name': 'Patient',
            'date_of_birth': '1960-01-15',
            'gender': 'M',
            'phone': '1234567890',
            'address': '123 Main St',
            'preferred_language': 'English',
        }
        response = self.client.post('/api/auth/register/patient/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['role'], 'PATIENT')

        # Verify user was created
        user = User.objects.get(username='patient1')
        self.assertEqual(user.role, 'PATIENT')
        self.assertTrue(user.check_password('TestPass123!'))
        self.assertTrue(hasattr(user, 'patient_profile'))

    def test_doctor_registration(self):
        data = {
            'username': 'doctor1',
            'password': 'TestPass123!',
            'password_confirm': 'TestPass123!',
            'first_name': 'Test',
            'last_name': 'Doctor',
            'phone': '9876543210',
            'email': 'doctor@test.com',
            'medical_registration_number': 'MED001',
            'specialization': 'Neurology',
            'hospital': 'City Hospital',
        }
        response = self.client.post('/api/auth/register/doctor/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertEqual(response.data['user']['role'], 'DOCTOR')

        user = User.objects.get(username='doctor1')
        self.assertEqual(user.role, 'DOCTOR')
        self.assertTrue(hasattr(user, 'doctor_profile'))
        self.assertEqual(user.doctor_profile.medical_registration_number, 'MED001')

    def test_login(self):
        User.objects.create_user(
            username='logintest', password='TestPass123!', role='PATIENT',
        )
        response = self.client.post('/api/auth/login/', {
            'username': 'logintest',
            'password': 'TestPass123!',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['role'], 'PATIENT')

    def test_login_invalid_credentials(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'nonexistent',
            'password': 'wrongpass',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_protected_endpoint_requires_auth(self):
        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_endpoint(self):
        user = User.objects.create_user(
            username='metest', password='TestPass123!', role='PATIENT',
            first_name='Me', last_name='Test',
        )
        self.client.force_authenticate(user=user)
        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'metest')
        self.assertEqual(response.data['role'], 'PATIENT')

    def test_password_mismatch(self):
        data = {
            'username': 'mismatch',
            'password': 'TestPass123!',
            'password_confirm': 'DifferentPass!',
            'first_name': 'Test',
            'last_name': 'User',
            'date_of_birth': '1960-01-15',
            'gender': 'M',
            'phone': '1234567890',
            'address': '123 Main St',
        }
        response = self.client.post('/api/auth/register/patient/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class AuthorizationTests(TestCase):
    """Tests for role-based access control."""

    def setUp(self):
        self.client = APIClient()
        self.patient = User.objects.create_user(
            username='patient_auth', password='TestPass123!',
            role='PATIENT', first_name='Auth', last_name='Patient',
        )
        self.doctor = User.objects.create_user(
            username='doctor_auth', password='TestPass123!',
            role='DOCTOR', first_name='Auth', last_name='Doctor',
        )
        self.caretaker = User.objects.create_user(
            username='caretaker_auth', password='TestPass123!',
            role='CARETAKER', first_name='Auth', last_name='Caretaker',
        )

    def test_patient_cannot_access_doctor_dashboard(self):
        self.client.force_authenticate(user=self.patient)
        response = self.client.get('/api/doctors/patients/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_doctor_cannot_access_patient_dashboard(self):
        self.client.force_authenticate(user=self.doctor)
        response = self.client.get('/api/patients/dashboard/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_caretaker_cannot_access_games(self):
        self.client.force_authenticate(user=self.caretaker)
        response = self.client.get('/api/games/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
