from django.urls import path
from . import views

urlpatterns = [
    path('scenarios/', views.scenario_list, name='scenario-list'),
    path('scenarios/<int:pk>/', views.scenario_detail, name='scenario-detail'),

    path('patient/<int:pk>/progress/', views.patient_progress, name='patient-progress'),
    path('patient/<int:pk>/history/', views.patient_history, name='patient-history'),
    path('patient/<int:pk>/difficulty/', views.patient_difficulty, name='patient-difficulty'),
    path('patients/', views.patient_list, name='patient-list'),

    path('game/start/', views.game_start, name='game-start'),
    path('game/answer/', views.game_answer, name='game-answer'),
    path('game/hint/', views.game_hint, name='game-hint'),
    path('game/complete/', views.game_complete, name='game-complete'),
]
