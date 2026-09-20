from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/patients/', include('apps.patients.urls')),
    path('api/caretakers/', include('apps.caretakers.urls')),
    path('api/doctors/', include('apps.doctors.urls')),
    path('api/games/', include('apps.games.urls')),
    path('api/progress/', include('apps.progress.urls')),
    path('api/notes/', include('apps.notes.urls')),
]
