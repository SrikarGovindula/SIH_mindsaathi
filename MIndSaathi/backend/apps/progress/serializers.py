from rest_framework import serializers

class ProgressSummarySerializer(serializers.Serializer):
    games_completed = serializers.IntegerField()
    sessions_count = serializers.IntegerField()
    overall_average_score = serializers.FloatField()
    memory_average = serializers.FloatField()
    pattern_average = serializers.FloatField()
    recall_average = serializers.FloatField()
