from rest_framework import serializers
from .models import Scenario, Activity, GameSession, GameAnswer
from users.models import Patient


class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ['id', 'name', 'image', 'sequence_order']


class ScenarioSerializer(serializers.ModelSerializer):
    activities = ActivitySerializer(many=True, read_only=True)

    class Meta:
        model = Scenario
        fields = [
            'id', 'name', 'description', 'difficulty_level',
            'language', 'active', 'activities',
        ]


class ScenarioListSerializer(serializers.ModelSerializer):
    """Lighter serializer for listing scenarios without every activity."""

    class Meta:
        model = Scenario
        fields = ['id', 'name', 'description', 'difficulty_level', 'language', 'active']


class GameAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameAnswer
        fields = [
            'id', 'session', 'question', 'selected_answer',
            'correct', 'response_time', 'created_at',
        ]
        read_only_fields = ['correct', 'created_at']


class GameSessionSerializer(serializers.ModelSerializer):
    scenario_name = serializers.CharField(source='scenario.name', read_only=True)
    performance_percentage = serializers.ReadOnlyField()

    class Meta:
        model = GameSession
        fields = [
            'id', 'patient', 'scenario', 'scenario_name', 'level', 'score',
            'correct_answers', 'incorrect_answers', 'hints_used',
            'completion_time', 'is_complete', 'created_at', 'completed_at',
            'performance_percentage',
        ]
        read_only_fields = [
            'score', 'correct_answers', 'incorrect_answers', 'hints_used',
            'is_complete', 'created_at', 'completed_at',
        ]


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ['id', 'name', 'age', 'preferred_language', 'current_level', 'created_at']
