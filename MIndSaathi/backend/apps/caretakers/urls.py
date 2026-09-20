from django.urls import path
from .views import (CaretakerProfileView, CreateInvitationView, ListInvitationsView, 
                    ManageCaretakersView, CaretakerPatientsView, CaretakerPatientDetailView)

urlpatterns = [
    path('profile/', CaretakerProfileView.as_view(), name='caretaker-profile'),
    path('invitations/', ListInvitationsView.as_view(), name='list-invitations'),
    path('invitations/create/', CreateInvitationView.as_view(), name='create-invitation'),
    path('patients/', CaretakerPatientsView.as_view(), name='caretaker-patients'),
    path('patients/<int:patient_id>/', CaretakerPatientDetailView.as_view(), name='caretaker-patient-detail'),
    path('manage/', ManageCaretakersView.as_view(), name='manage-caretakers'),
    path('manage/<int:pk>/', ManageCaretakersView.as_view(), name='manage-caretaker-detail'),
]
