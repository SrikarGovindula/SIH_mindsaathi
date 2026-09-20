from django.urls import path
from .views import (
    PatientProfileView, PatientDashboardView,
    ReminderListCreateView, ReminderToggleCompleteView,
    CaregiverAlertListView, CaregiverAlertResolveView,
)

urlpatterns = [
    path('profile/', PatientProfileView.as_view(), name='patient-profile'),
    path('dashboard/', PatientDashboardView.as_view(), name='patient-dashboard'),
    path('reminders/', ReminderListCreateView.as_view(), name='patient-reminders'),
    path('reminders/<int:reminder_id>/', ReminderToggleCompleteView.as_view(), name='patient-reminder-toggle'),
    path('alerts/', CaregiverAlertListView.as_view(), name='caregiver-alerts'),
    path('alerts/<int:alert_id>/resolve/', CaregiverAlertResolveView.as_view(), name='caregiver-alert-resolve'),
]
