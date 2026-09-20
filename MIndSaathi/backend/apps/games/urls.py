from django.urls import path
from .views import (
    GameListView, GameDetailView, GameLevelsView,
    GameStartView, GameSubmitView, GameHistoryView,
    AICognitiveRecommendationView,
)

urlpatterns = [
    path('', GameListView.as_view(), name='game-list'),
    path('history/', GameHistoryView.as_view(), name='game-history'),
    path('ai-recommendation/', AICognitiveRecommendationView.as_view(), name='ai-recommendation'),
    path('<int:game_id>/', GameDetailView.as_view(), name='game-detail'),
    path('<int:game_id>/levels/', GameLevelsView.as_view(), name='game-levels'),
    path('<int:game_id>/start/', GameStartView.as_view(), name='game-start'),
    path('<int:game_id>/submit/', GameSubmitView.as_view(), name='game-submit'),
]
