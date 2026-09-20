from django.urls import path
from .views import (DoctorProfileView, DoctorPatientsView, DoctorPatientDetailView, PatientConnectionRequestsView)

urlpatterns = [
    path('profile/', DoctorProfileView.as_view(), name='doctor-profile'),
    path('patients/', DoctorPatientsView.as_view(), name='doctor-patients'),
    path('patients/<int:patient_id>/', DoctorPatientDetailView.as_view(), name='doctor-patient-detail'),
    path('connection-requests/', PatientConnectionRequestsView.as_view(), name='patient-connection-requests'),
]
