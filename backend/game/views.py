from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from users.models import Patient
from .models import Scenario, GameSession, GameAnswer
from .serializers import (
    ScenarioSerializer, ScenarioListSerializer,
    GameSessionSerializer, PatientSerializer,
)
from . import logic


# ---------------------------------------------------------------------------
# Scenarios
# ---------------------------------------------------------------------------

@api_view(['GET'])
def scenario_list(request):
    scenarios = Scenario.objects.filter(active=True)
    serializer = ScenarioListSerializer(scenarios, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def scenario_detail(request, pk):
    scenario = get_object_or_404(Scenario, pk=pk)
    serializer = ScenarioSerializer(scenario)
    return Response(serializer.data)


# ---------------------------------------------------------------------------
# Patient progress / history / difficulty
# ---------------------------------------------------------------------------

@api_view(['GET'])
def patient_progress(request, pk):
    patient = get_object_or_404(Patient, pk=pk)
    completed_sessions = GameSession.objects.filter(patient=patient, is_complete=True)

    games_completed = completed_sessions.count()
    hints_used = sum(s.hints_used for s in completed_sessions)

    if games_completed:
        avg_performance = round(
            sum(s.performance_percentage for s in completed_sessions) / games_completed, 1
        )
    else:
        avg_performance = 0

    recent = completed_sessions.order_by('-completed_at')[:5]
    recent_data = [
        {
            "date": s.completed_at.date().isoformat() if s.completed_at else None,
            "performance_percentage": s.performance_percentage,
            "scenario": s.scenario.name,
        }
        for s in recent
    ]

    return Response({
        "patient_id": patient.id,
        "patient_name": patient.name,
        "games_completed": games_completed,
        "current_level": patient.current_level,
        "game_performance_percentage": avg_performance,
        "hints_used": hints_used,
        "recent_sessions": recent_data,
        "disclaimer": (
            "This reflects game performance and memory-practice activity only. "
            "It is not a medical diagnosis or a measure of dementia severity."
        ),
    })


@api_view(['GET'])
def patient_history(request, pk):
    patient = get_object_or_404(Patient, pk=pk)
    sessions = GameSession.objects.filter(patient=patient, is_complete=True).order_by('-completed_at')

    if not sessions.exists():
        return Response({
            "patient_id": patient.id,
            "history": [],
            "message": "No games completed yet. Start your first MY DAY activity.",
        })

    history = [
        {
            "session_id": s.id,
            "date": s.completed_at.isoformat() if s.completed_at else None,
            "scenario": s.scenario.name,
            "level": s.level,
            "performance_percentage": s.performance_percentage,
            "correct_answers": s.correct_answers,
            "incorrect_answers": s.incorrect_answers,
            "hints_used": s.hints_used,
        }
        for s in sessions
    ]

    return Response({"patient_id": patient.id, "history": history})


@api_view(['GET'])
def patient_difficulty(request, pk):
    patient = get_object_or_404(Patient, pk=pk)
    last_session = GameSession.objects.filter(
        patient=patient, is_complete=True
    ).order_by('-completed_at').first()

    if not last_session:
        return Response({
            "patient_id": patient.id,
            "current_level": patient.current_level,
            "recommended_level": patient.current_level,
            "message": "No completed sessions yet; keep the current level.",
        })

    recommended = logic.calculate_new_level(
        last_session.level, last_session.performance_percentage
    )

    return Response({
        "patient_id": patient.id,
        "current_level": patient.current_level,
        "last_session_accuracy": last_session.performance_percentage,
        "recommended_level": recommended,
    })


# ---------------------------------------------------------------------------
# Gameplay: start / answer / complete
# ---------------------------------------------------------------------------

@api_view(['POST'])
def game_start(request):
    patient_id = request.data.get('patient_id')
    scenario_id = request.data.get('scenario_id')
    level = request.data.get('level')

    if not patient_id or not scenario_id or not level:
        return Response(
            {"error": "patient_id, scenario_id, and level are all required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        level = int(level)
    except (TypeError, ValueError):
        return Response({"error": "level must be an integer."}, status=status.HTTP_400_BAD_REQUEST)

    if level < 1 or level > 5:
        return Response({"error": "level must be between 1 and 5."}, status=status.HTTP_400_BAD_REQUEST)

    patient = get_object_or_404(Patient, pk=patient_id)
    scenario = get_object_or_404(Scenario, pk=scenario_id)

    if scenario.activities.count() < 2:
        return Response(
            {"error": "This scenario does not have enough activities configured yet."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    question_queue = logic.build_question_queue(scenario, level)

    session = GameSession.objects.create(
        patient=patient,
        scenario=scenario,
        level=level,
        question_queue=question_queue,
        current_question_index=0,
    )

    first_question = logic.public_question(question_queue[0])

    return Response({
        "session_id": session.id,
        "patient_id": patient.id,
        "scenario": ScenarioSerializer(scenario).data,
        "level": level,
        "total_questions": len(question_queue),
        "question_index": 0,
        "question": first_question,
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def game_hint(request):
    """Return a hint-adjusted version of the current question."""
    session_id = request.data.get('session_id')
    if not session_id:
        return Response({"error": "session_id is required."}, status=status.HTTP_400_BAD_REQUEST)

    session = get_object_or_404(GameSession, pk=session_id)

    if session.is_complete:
        return Response(
            {"error": "This game session has already ended; hints are no longer available."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if session.current_question_index >= len(session.question_queue):
        return Response({"error": "No active question for this session."}, status=status.HTTP_400_BAD_REQUEST)

    question = session.question_queue[session.current_question_index]
    session.hints_used += 1
    session.save(update_fields=['hints_used'])

    return Response({
        "session_id": session.id,
        "hints_used": session.hints_used,
        "question": logic.apply_hint(question),
    })


@api_view(['POST'])
def game_answer(request):
    session_id = request.data.get('session_id')
    selected_answer = request.data.get('selected_answer')
    response_time = request.data.get('response_time')
    question_text = request.data.get('question', '')

    if not session_id or selected_answer is None:
        return Response(
            {"error": "session_id and selected_answer are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    session = get_object_or_404(GameSession, pk=session_id)

    if session.is_complete:
        return Response(
            {"error": "This game session has already ended."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if session.current_question_index >= len(session.question_queue):
        return Response(
            {"error": "There is no active question for this session."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    current_question = session.question_queue[session.current_question_index]
    is_correct = logic.check_answer(current_question, selected_answer)

    try:
        response_time_value = float(response_time) if response_time is not None else None
    except (TypeError, ValueError):
        response_time_value = None

    GameAnswer.objects.create(
        session=session,
        question=question_text or current_question.get('prompt', ''),
        selected_answer=str(selected_answer),
        correct=is_correct,
        response_time=response_time_value,
    )

    if is_correct:
        session.correct_answers += 1
    else:
        session.incorrect_answers += 1

    session.current_question_index += 1
    has_next = session.current_question_index < len(session.question_queue)
    session.save(update_fields=['correct_answers', 'incorrect_answers', 'current_question_index'])

    payload = {
        "session_id": session.id,
        "correct": is_correct,
        "feedback": logic.CORRECT_FEEDBACK if is_correct else logic.INCORRECT_FEEDBACK,
        "correct_answer": current_question['correct_answer'],
        "correct_answers": session.correct_answers,
        "incorrect_answers": session.incorrect_answers,
        "has_next_question": has_next,
    }

    if has_next:
        payload["question_index"] = session.current_question_index
        payload["question"] = logic.public_question(
            session.question_queue[session.current_question_index]
        )

    return Response(payload)


@api_view(['POST'])
def game_complete(request):
    session_id = request.data.get('session_id')
    completion_time = request.data.get('completion_time')

    if not session_id:
        return Response({"error": "session_id is required."}, status=status.HTTP_400_BAD_REQUEST)

    session = get_object_or_404(GameSession, pk=session_id)

    if session.is_complete:
        return Response(
            {"error": "This game session has already been completed."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        session.completion_time = int(completion_time) if completion_time is not None else None
    except (TypeError, ValueError):
        session.completion_time = None

    session.score = session.performance_percentage
    session.is_complete = True
    session.completed_at = timezone.now()
    session.save()

    # Adaptive difficulty: adjust the patient's stored level by at most one step.
    new_level = logic.calculate_new_level(session.level, session.performance_percentage)
    patient = session.patient
    patient.current_level = new_level
    patient.save(update_fields=['current_level'])

    return Response({
        "session_id": session.id,
        "score": session.score,
        "correct_answers": session.correct_answers,
        "incorrect_answers": session.incorrect_answers,
        "hints_used": session.hints_used,
        "completion_time": session.completion_time,
        "level": session.level,
        "scenario": session.scenario.name,
        "performance_percentage": session.performance_percentage,
        "recommended_next_level": new_level,
    })


# ---------------------------------------------------------------------------
# Patient (minimal helper endpoints, used by the seed data / frontend setup)
# ---------------------------------------------------------------------------

@api_view(['GET'])
def patient_list(request):
    patients = Patient.objects.all()
    serializer = PatientSerializer(patients, many=True)
    return Response(serializer.data)
