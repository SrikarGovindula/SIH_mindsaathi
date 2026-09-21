from django.db import models
from users.models import Patient


class Scenario(models.Model):
    """
    A named everyday-life sequence of activities (e.g. "Morning Routine").
    Scenarios live in the database so new ones can be added without any
    frontend code changes.
    """

    LANGUAGE_CHOICES = Patient.LANGUAGE_CHOICES

    name = models.CharField(max_length=150)
    description = models.CharField(max_length=300, blank=True)
    difficulty_level = models.PositiveSmallIntegerField(
        default=1,
        help_text="Suggested level (1-5) this scenario is best used at."
    )
    language = models.CharField(max_length=10, choices=LANGUAGE_CHOICES, default='en')
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ['difficulty_level', 'name']

    def __str__(self):
        return f"{self.name} (L{self.difficulty_level})"


class Activity(models.Model):
    """
    A single step within a Scenario, in its correct sequence order.
    """

    scenario = models.ForeignKey(
        Scenario, related_name='activities', on_delete=models.CASCADE
    )
    name = models.CharField(max_length=150)
    image = models.CharField(
        max_length=255, blank=True,
        help_text="Emoji, icon name, or path under /assets used to represent this activity."
    )
    sequence_order = models.PositiveSmallIntegerField()

    class Meta:
        ordering = ['scenario', 'sequence_order']
        constraints = [
            models.UniqueConstraint(
                fields=['scenario', 'sequence_order'],
                name='unique_sequence_order_per_scenario'
            )
        ]
        indexes = [
            models.Index(fields=['scenario', 'sequence_order']),
        ]

    def __str__(self):
        return f"{self.scenario.name} #{self.sequence_order}: {self.name}"


class GameSession(models.Model):
    """
    One play-through of a scenario at a given level by a given patient.
    """

    patient = models.ForeignKey(
        Patient, related_name='sessions', on_delete=models.CASCADE
    )
    scenario = models.ForeignKey(
        Scenario, related_name='sessions', on_delete=models.CASCADE
    )
    level = models.PositiveSmallIntegerField()
    score = models.FloatField(default=0)
    correct_answers = models.PositiveIntegerField(default=0)
    incorrect_answers = models.PositiveIntegerField(default=0)
    hints_used = models.PositiveIntegerField(default=0)
    completion_time = models.PositiveIntegerField(
        null=True, blank=True, help_text="Seconds taken to complete the session."
    )
    is_complete = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    # Internal bookkeeping used by the backend to generate and check
    # questions. This is never exposed directly to the frontend; it is
    # how the backend stays the single source of truth for correctness.
    question_queue = models.JSONField(default=list, blank=True)
    current_question_index = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['patient', '-created_at']),
        ]

    def __str__(self):
        return f"Session #{self.id} - {self.patient.name} - {self.scenario.name} (L{self.level})"

    @property
    def performance_percentage(self):
        total = self.correct_answers + self.incorrect_answers
        if total == 0:
            return 0
        return round((self.correct_answers / total) * 100, 1)


class GameAnswer(models.Model):
    """
    A single answered question within a GameSession.
    """

    session = models.ForeignKey(
        GameSession, related_name='answers', on_delete=models.CASCADE
    )
    question = models.CharField(max_length=255)
    selected_answer = models.CharField(max_length=255)
    correct = models.BooleanField()
    response_time = models.FloatField(
        null=True, blank=True, help_text="Seconds taken to answer."
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        status = "correct" if self.correct else "incorrect"
        return f"Answer #{self.id} ({status}) - Session #{self.session_id}"
