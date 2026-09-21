from django.db import models


class Patient(models.Model):
    """
    Represents an elderly person using the MY DAY cognitive activity game.

    This model intentionally stores only what the game needs to run and
    to personalize the experience (name, age, preferred language, and the
    current adaptive-difficulty level). It is NOT a medical record.
    """

    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('hi', 'Hindi'),
        ('as', 'Assamese'),
        ('bn', 'Bengali'),
        ('mni', 'Manipuri'),
    ]

    name = models.CharField(max_length=150)
    age = models.PositiveIntegerField(null=True, blank=True)
    preferred_language = models.CharField(
        max_length=10, choices=LANGUAGE_CHOICES, default='en'
    )
    current_level = models.PositiveSmallIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} (Level {self.current_level})"

    def save(self, *args, **kwargs):
        # Keep the level safely within the game's 5-level range.
        if self.current_level < 1:
            self.current_level = 1
        if self.current_level > 5:
            self.current_level = 5
        super().save(*args, **kwargs)
