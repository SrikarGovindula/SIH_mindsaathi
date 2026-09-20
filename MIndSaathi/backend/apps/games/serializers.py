from rest_framework import serializers
from .models import Game, GameLevel, GameSession


class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['id', 'name', 'description', 'game_type', 'icon', 'is_active']


class GameLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameLevel
        fields = ['id', 'game', 'level_number', 'config']


class GameSessionSerializer(serializers.ModelSerializer):
    game_name = serializers.CharField(source='game.name', read_only=True)
    game_icon = serializers.CharField(source='game.icon', read_only=True)
    game_type = serializers.CharField(source='game.game_type', read_only=True)
    level_number = serializers.IntegerField(source='level.level_number', read_only=True)

    class Meta:
        model = GameSession
        fields = [
            'id', 'patient', 'game', 'game_name', 'game_icon', 'game_type',
            'level', 'level_number', 'score', 'correct_answers', 'wrong_answers',
            'accuracy', 'response_time_ms', 'attempts', 'completed',
            'started_at', 'completed_at',
        ]


class GameStartSerializer(serializers.Serializer):
    level_number = serializers.IntegerField(default=1)


class GameSubmitSerializer(serializers.Serializer):
    session_id = serializers.IntegerField()
    correct_answers = serializers.IntegerField(min_value=0)
    wrong_answers = serializers.IntegerField(min_value=0)
    response_time_ms = serializers.IntegerField(min_value=0)
