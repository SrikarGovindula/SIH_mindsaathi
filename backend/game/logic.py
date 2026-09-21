"""
Core gameplay logic for MY DAY.

The backend is the single source of truth for:
  - which questions are asked
  - what the correct answers are
  - whether a submitted answer is correct
  - how scoring and adaptive difficulty work

The frontend only ever receives questions with answer choices (never the
correct answer), and it only ever finds out if it was right by calling
/api/game/answer/.
"""
import random


# Friendly, non-judgmental feedback shown regardless of correctness.
CORRECT_FEEDBACK = "🌟 Well done! You remembered it!"
INCORRECT_FEEDBACK = "❤️ Good try! Let's try again."


def _shuffled_choices(correct_value, all_values, choice_count):
    """
    Build a shuffled list of `choice_count` answer choices that always
    includes `correct_value`, drawing distractors from `all_values`.
    """
    distractors = [v for v in all_values if v != correct_value]
    random.shuffle(distractors)
    needed = max(0, choice_count - 1)
    choices = [correct_value] + distractors[:needed]
    random.shuffle(choices)
    return choices


def build_question_queue(scenario, level):
    """
    Generate the full list of questions for a session, based on the
    scenario's activities and the selected level's rules. Each question
    is a dict:

        {
            "type": "first" | "next_after" | "before" | "last" | "ordering",
            "prompt": "<question text shown to the user>",
            "choices": [<display strings>],   # omitted for "ordering"
            "activities": [<display strings>],# shuffled cards for "ordering"
            "correct_answer": "<string>",      # never sent to the frontend
        }

    Levels increase gradually in difficulty per the game design:
      Level 1: "What comes first?" (2-3 activities)
      Level 2: full ordering task (3 activities)
      Level 3: "What comes after X?" with 3 choices (4 activities)
      Level 4: multiple sequence questions, 3 choices each (4-5 activities)
      Level 5: multiple sequence questions, 3 choices each (5-6 activities)
    """
    activities = list(
        scenario.activities.order_by('sequence_order').values_list('name', flat=True)
    )
    all_names = activities  # used as the pool for plausible distractors

    questions = []

    if level == 1:
        first = activities[0]
        questions.append({
            "type": "first",
            "prompt": "What comes first?",
            "choices": _shuffled_choices(first, all_names, min(3, len(activities))),
            "correct_answer": first,
        })

    elif level == 2:
        shuffled = activities[:]
        random.shuffle(shuffled)
        questions.append({
            "type": "ordering",
            "prompt": "Put these activities in the correct order.",
            "activities": shuffled,
            "correct_answer": ",".join(activities),
        })

    elif level == 3:
        # "What comes after brushing your teeth?" style question.
        idx = 1 if len(activities) > 2 else 0
        after = activities[idx + 1] if idx + 1 < len(activities) else activities[-1]
        questions.append({
            "type": "next_after",
            "prompt": f"What comes after \"{activities[idx]}\"?",
            "choices": _shuffled_choices(after, all_names, 3),
            "correct_answer": after,
        })

    elif level == 4:
        # A short scenario with several sequence questions, 3 choices each.
        questions.append({
            "type": "first",
            "prompt": "What happened first?",
            "choices": _shuffled_choices(activities[0], all_names, 3),
            "correct_answer": activities[0],
        })
        if len(activities) > 2:
            questions.append({
                "type": "next_after",
                "prompt": f"What came after \"{activities[1]}\"?",
                "choices": _shuffled_choices(activities[2], all_names, 3),
                "correct_answer": activities[2],
            })
        questions.append({
            "type": "last",
            "prompt": "What happened last?",
            "choices": _shuffled_choices(activities[-1], all_names, 3),
            "correct_answer": activities[-1],
        })

    else:  # level 5 and any higher fallback
        mid = len(activities) // 2
        before_target = activities[mid]
        before_answer = activities[mid - 1] if mid > 0 else activities[0]
        questions.append({
            "type": "before",
            "prompt": f"Which activity came before \"{before_target}\"?",
            "choices": _shuffled_choices(before_answer, all_names, 3),
            "correct_answer": before_answer,
        })

        after_target = activities[0]
        after_answer = activities[1] if len(activities) > 1 else activities[0]
        questions.append({
            "type": "next_after",
            "prompt": f"Which activity came after \"{after_target}\"?",
            "choices": _shuffled_choices(after_answer, all_names, 3),
            "correct_answer": after_answer,
        })

        questions.append({
            "type": "last",
            "prompt": "What was the last activity?",
            "choices": _shuffled_choices(activities[-1], all_names, 3),
            "correct_answer": activities[-1],
        })

    return questions


def public_question(question):
    """Strip the correct_answer before sending a question to the frontend."""
    safe = {k: v for k, v in question.items() if k != "correct_answer"}
    return safe


def check_answer(question, selected_answer):
    """Compare a submitted answer against the stored correct answer."""
    correct_value = question.get("correct_answer", "")
    return (selected_answer or "").strip() == correct_value.strip()


def apply_hint(question):
    """
    Return a hint-adjusted copy of a question for the frontend:
    for choice-based questions, remove one incorrect choice.
    For ordering questions, reveal the first correct activity's position.
    """
    hinted = public_question(question)
    if "choices" in hinted and len(hinted["choices"]) > 2:
        correct_value = question["correct_answer"]
        wrong_choices = [c for c in hinted["choices"] if c != correct_value]
        if wrong_choices:
            remove = random.choice(wrong_choices)
            hinted["choices"] = [c for c in hinted["choices"] if c != remove]
    elif hinted.get("type") == "ordering":
        hinted["hint_note"] = f"The first activity is \"{question['correct_answer'].split(',')[0]}\"."
    return hinted


def calculate_new_level(current_level, accuracy_percentage):
    """
    Adaptive difficulty rule:
      accuracy >= 80%      -> level + 1 (max 5)
      50% <= accuracy < 80 -> unchanged
      accuracy < 50%       -> level - 1 (min 1)
    Never changes by more than one level at a time.
    """
    if accuracy_percentage >= 80:
        new_level = current_level + 1
    elif accuracy_percentage < 50:
        new_level = current_level - 1
    else:
        new_level = current_level

    return max(1, min(5, new_level))
