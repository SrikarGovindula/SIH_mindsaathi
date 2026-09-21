from django.contrib import admin
from .models import Scenario, Activity, GameSession, GameAnswer


class ActivityInline(admin.TabularInline):
    model = Activity
    extra = 1


@admin.register(Scenario)
class ScenarioAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'difficulty_level', 'language', 'active')
    inlines = [ActivityInline]


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ('id', 'scenario', 'name', 'sequence_order')
    list_filter = ('scenario',)


@admin.register(GameSession)
class GameSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'scenario', 'level', 'is_complete', 'score', 'created_at')
    list_filter = ('level', 'is_complete', 'scenario')


@admin.register(GameAnswer)
class GameAnswerAdmin(admin.ModelAdmin):
    list_display = ('id', 'session', 'question', 'selected_answer', 'correct', 'created_at')
    list_filter = ('correct',)
