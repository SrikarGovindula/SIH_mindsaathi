from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    PatientRegistrationView,
    DoctorRegistrationView,
    CaretakerActivationView,
    CurrentUserView,
    CustomTokenObtainPairView
)

urlpatterns = [
    path('register/patient/', PatientRegistrationView.as_view(), name='register_patient'),
    path('register/doctor/', DoctorRegistrationView.as_view(), name='register_doctor'),
    path('register/caretaker/', CaretakerActivationView.as_view(), name='register_caretaker'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
]
