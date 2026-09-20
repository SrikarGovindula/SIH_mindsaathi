from django.urls import path
from .views import CaretakerNoteListCreateView, DoctorNoteListCreateView, PatientNotesView

urlpatterns = [
    path('caretaker/', CaretakerNoteListCreateView.as_view(), name='caretaker-notes'),
    path('doctor/', DoctorNoteListCreateView.as_view(), name='doctor-notes'),
    path('patient/', PatientNotesView.as_view(), name='patient-notes'),
]
