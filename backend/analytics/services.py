"""
Lightweight analytics helpers built on top of stored GameSession data.

These are used by the game app's progress/history/difficulty endpoints
and are kept separate so reporting logic doesn't clutter the gameplay
views. Nothing here diagnoses or measures medical conditions; it only
summarizes game-performance numbers that are already stored in Django.
"""


def average_performance(sessions):
    """Return the average performance_percentage across a queryset/list of sessions."""
    sessions = list(sessions)
    if not sessions:
        return 0
    return round(sum(s.performance_percentage for s in sessions) / len(sessions), 1)


def total_hints_used(sessions):
    return sum(s.hints_used for s in sessions)
