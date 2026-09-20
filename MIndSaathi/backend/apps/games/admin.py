from django.contrib import admin

from apps.games.models import Game, GameLevel, GameSession


@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ("name", "game_type", "is_active")
    list_filter = ("is_active",)


@admin.register(GameLevel)
class GameLevelAdmin(admin.ModelAdmin):
    list_display = ("game", "level_number")
    list_filter = ("game",)


@admin.register(GameSession)
class GameSessionAdmin(admin.ModelAdmin):
    list_display = ("patient", "game", "level", "score", "completed", "started_at")
    list_filter = ("game", "completed")
    search_fields = ("patient__username",)
