from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Game, GameLevel, GameSession
from .serializers import (
    GameSerializer, GameLevelSerializer, GameSessionSerializer,
    GameSubmitSerializer,
)
from apps.accounts.permissions import IsPatient
from .scoring import calculate_score, calculate_accuracy
from .ai_engine import get_ai_cognitive_recommendation


class GameListView(APIView):
    permission_classes = [IsPatient]

    def get(self, request):
        games = Game.objects.filter(is_active=True)
        serializer = GameSerializer(games, many=True)
        return Response(serializer.data)


class GameDetailView(APIView):
    permission_classes = [IsPatient]

    def get(self, request, game_id):
        game = get_object_or_404(Game, id=game_id, is_active=True)
        serializer = GameSerializer(game)
        levels = GameLevel.objects.filter(game=game)
        levels_serializer = GameLevelSerializer(levels, many=True)
        data = serializer.data
        data['levels'] = levels_serializer.data
        return Response(data)


class GameLevelsView(APIView):
    permission_classes = [IsPatient]

    def get(self, request, game_id):
        game = get_object_or_404(Game, id=game_id, is_active=True)
        levels = GameLevel.objects.filter(game=game)
        serializer = GameLevelSerializer(levels, many=True)
        return Response(serializer.data)


class GameStartView(APIView):
    permission_classes = [IsPatient]

    def post(self, request, game_id):
        game = get_object_or_404(Game, id=game_id, is_active=True)

        level_number = request.data.get('level_number', 1)
        level = get_object_or_404(GameLevel, game=game, level_number=level_number)

        session = GameSession.objects.create(
            patient=request.user,
            game=game,
            level=level,
        )
        serializer = GameSessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class GameSubmitView(APIView):
    permission_classes = [IsPatient]

    def post(self, request, game_id):
        serializer = GameSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        session = get_object_or_404(
            GameSession,
            id=serializer.validated_data['session_id'],
            patient=request.user,
            game__id=game_id,
            completed=False,
        )

        correct_answers = serializer.validated_data['correct_answers']
        wrong_answers = serializer.validated_data['wrong_answers']
        response_time_ms = serializer.validated_data['response_time_ms']

        score = calculate_score(
            correct_answers, wrong_answers, response_time_ms,
            session.level.level_number,
        )
        accuracy = calculate_accuracy(correct_answers, wrong_answers)

        session.correct_answers = correct_answers
        session.wrong_answers = wrong_answers
        session.response_time_ms = response_time_ms
        session.score = score
        session.accuracy = accuracy
        session.completed = True
        session.completed_at = timezone.now()
        session.save()

        return Response(GameSessionSerializer(session).data)


class GameHistoryView(APIView):
    permission_classes = [IsPatient]

    def get(self, request):
        sessions = GameSession.objects.filter(
            patient=request.user, completed=True,
        ).order_by('-completed_at')

        game_id = request.query_params.get('game_id')
        if game_id:
            sessions = sessions.filter(game_id=game_id)

        serializer = GameSessionSerializer(sessions[:100], many=True)
        return Response(serializer.data)


class AICognitiveRecommendationView(APIView):
    """
    Returns real-time personalized AI cognitive recommendations,
    optimal adaptive difficulty level, and regional North-East guidance.
    """

    permission_classes = [IsPatient]

    def get(self, request):
        recommendation = get_ai_cognitive_recommendation(request.user)
        return Response(recommendation)
