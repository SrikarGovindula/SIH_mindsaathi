"""
Deterministic scoring logic for game sessions.
Scores are normalized to 0-100.
"""


def calculate_score(correct_answers, wrong_answers, response_time_ms, level_number, time_limit_ms=None):
    """
    Calculate a normalized game score (0-100).

    Components:
    - Accuracy (60% weight): correct / total
    - Speed (25% weight): bonus for faster responses
    - Level (15% weight): bonus for higher levels

    All scoring is deterministic — no AI involved.
    """
    total = correct_answers + wrong_answers
    if total == 0:
        return 0.0

    # Accuracy component (0-60 points)
    accuracy = correct_answers / total
    accuracy_score = accuracy * 60

    # Speed component (0-25 points)
    # Faster responses get more points
    # Base: 5000ms is "average" speed per question
    avg_response = response_time_ms / max(total, 1)
    if avg_response <= 1000:
        speed_score = 25.0
    elif avg_response >= 10000:
        speed_score = 0.0
    else:
        # Linear interpolation between 1000ms (best) and 10000ms (worst)
        speed_score = max(0, 25 * (1 - (avg_response - 1000) / 9000))

    # Level component (0-15 points)
    # Higher levels get a small bonus to reward progression
    level_score = min(15, (level_number / 10) * 15)

    total_score = round(accuracy_score + speed_score + level_score, 2)
    return min(100.0, max(0.0, total_score))


def calculate_accuracy(correct_answers, wrong_answers):
    """Calculate accuracy as a percentage."""
    total = correct_answers + wrong_answers
    if total == 0:
        return 0.0
    return round((correct_answers / total) * 100, 2)
