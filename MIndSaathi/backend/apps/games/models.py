from django.conf import settings
from django.db import models


class Game(models.Model):
    """A cognitive game type."""

    class GameType(models.TextChoices):
        MEMORY_MATCH = 'MEMORY_MATCH', 'Memory Match'
        PATTERN_SEQUENCE = 'PATTERN_SEQUENCE', 'Pattern & Sequence'
        DAILY_RECALL = 'DAILY_RECALL', 'Daily Recall'

    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    game_type = models.CharField(
        max_length=20,
        choices=GameType.choices,
        unique=True,
    )
    icon = models.CharField(max_length=50, default='🧠')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'games'

    def __str__(self):
        return self.name


class GameLevel(models.Model):
    """A level within a game with difficulty configuration."""

    game = models.ForeignKey(
        Game,
        on_delete=models.CASCADE,
        related_name='levels',
    )
    level_number = models.PositiveIntegerField()
    config = models.JSONField(
        default=dict,
        help_text='Level-specific parameters: num_items, display_time, etc.',
    )

    class Meta:
        db_table = 'game_levels'
        ordering = ['game', 'level_number']
        constraints = [
            models.UniqueConstraint(
                fields=['game', 'level_number'],
                name='unique_game_level',
            ),
        ]

    def __str__(self):
        return f'{self.game.name} — Level {self.level_number}'


class GameSession(models.Model):
    """A single play session of a game by a patient."""

    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='game_sessions',
        limit_choices_to={'role': 'PATIENT'},
    )
    game = models.ForeignKey(
        Game,
        on_delete=models.CASCADE,
        related_name='sessions',
    )
    level = models.ForeignKey(
        GameLevel,
        on_delete=models.CASCADE,
        related_name='sessions',
    )
    score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        help_text='Normalized score 0-100',
    )
    correct_answers = models.PositiveIntegerField(default=0)
    wrong_answers = models.PositiveIntegerField(default=0)
    accuracy = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        help_text='Accuracy percentage 0-100',
    )
    response_time_ms = models.PositiveIntegerField(
        default=0,
        help_text='Average response time in milliseconds',
    )
    attempts = models.PositiveIntegerField(default=1)
    completed = models.BooleanField(default=False)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'game_sessions'
        ordering = ['-started_at']

    def __str__(self):
        status = '✓' if self.completed else '…'
        return f'{self.patient.get_full_name()} — {self.game.name} L{self.level.level_number} {status}'
