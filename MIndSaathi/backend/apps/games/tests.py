from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from apps.games.models import Game, GameLevel, GameSession
from apps.games.scoring import calculate_score, calculate_accuracy

User = get_user_model()


class GameModelTests(TestCase):
    """Tests for game models and seed data."""

    def setUp(self):
        from django.core.management import call_command
        call_command('seed_games', verbosity=0)

    def test_three_games_exist(self):
        self.assertEqual(Game.objects.count(), 3)

    def test_ten_levels_per_game(self):
        for game in Game.objects.all():
            self.assertEqual(game.levels.count(), 10)

    def test_thirty_total_levels(self):
        self.assertEqual(GameLevel.objects.count(), 30)

    def test_game_types(self):
        types = set(Game.objects.values_list('game_type', flat=True))
        self.assertEqual(types, {'MEMORY_MATCH', 'PATTERN_SEQUENCE', 'DAILY_RECALL'})

    def test_seed_is_idempotent(self):
        from django.core.management import call_command
        call_command('seed_games', verbosity=0)
        self.assertEqual(Game.objects.count(), 3)
        self.assertEqual(GameLevel.objects.count(), 30)

    def test_level_configs_exist(self):
        for level in GameLevel.objects.all():
            self.assertIsInstance(level.config, dict)
            self.assertTrue(len(level.config) > 0)


class ScoringTests(TestCase):
    """Tests for the scoring module."""

    def test_perfect_score(self):
        score = calculate_score(10, 0, 5000, 10)
        self.assertGreater(score, 80)
        self.assertLessEqual(score, 100)

    def test_zero_score(self):
        score = calculate_score(0, 0, 0, 1)
        self.assertEqual(score, 0)

    def test_accuracy_calculation(self):
        accuracy = calculate_accuracy(7, 3)
        self.assertEqual(accuracy, 70.0)

    def test_accuracy_zero_total(self):
        accuracy = calculate_accuracy(0, 0)
        self.assertEqual(accuracy, 0.0)

    def test_higher_level_gives_more_points(self):
        score_low = calculate_score(5, 5, 5000, 1)
        score_high = calculate_score(5, 5, 5000, 10)
        self.assertGreater(score_high, score_low)

    def test_faster_response_gives_more_points(self):
        score_slow = calculate_score(5, 0, 50000, 5)
        score_fast = calculate_score(5, 0, 5000, 5)
        self.assertGreater(score_fast, score_slow)


class GameSessionTests(TestCase):
    """Tests for game session API."""

    def setUp(self):
        from django.core.management import call_command
        call_command('seed_games', verbosity=0)

        self.client = APIClient()
        self.patient = User.objects.create_user(
            username='gamepatient', password='TestPass123!',
            role='PATIENT', first_name='Game', last_name='Player',
        )
        from apps.patients.models import PatientProfile
        PatientProfile.objects.create(user=self.patient)
        self.client.force_authenticate(user=self.patient)

    def test_list_games(self):
        response = self.client.get('/api/games/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

    def test_game_detail(self):
        game = Game.objects.first()
        response = self.client.get(f'/api/games/{game.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('levels', response.data)
        self.assertEqual(len(response.data['levels']), 10)

    def test_start_game_session(self):
        game = Game.objects.first()
        response = self.client.post(f'/api/games/{game.id}/start/', {
            'level_number': 1,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['completed'], False)

    def test_submit_game_session(self):
        game = Game.objects.first()
        # Start a session
        start_resp = self.client.post(f'/api/games/{game.id}/start/', {
            'level_number': 1,
        }, format='json')
        session_id = start_resp.data['id']

        # Submit results
        submit_resp = self.client.post(f'/api/games/{game.id}/submit/', {
            'session_id': session_id,
            'correct_answers': 8,
            'wrong_answers': 2,
            'response_time_ms': 5000,
        }, format='json')
        self.assertEqual(submit_resp.status_code, status.HTTP_200_OK)
        self.assertTrue(submit_resp.data['completed'])
        self.assertGreater(float(submit_resp.data['score']), 0)

    def test_game_history(self):
        game = Game.objects.first()
        level = game.levels.first()
        GameSession.objects.create(
            patient=self.patient, game=game, level=level,
            score=75, correct_answers=8, wrong_answers=2,
            accuracy=80, completed=True,
        )
        response = self.client.get('/api/games/history/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_invalid_level(self):
        game = Game.objects.first()
        response = self.client.post(f'/api/games/{game.id}/start/', {
            'level_number': 99,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class ProgressTests(TestCase):
    """Tests for progress API."""

    def setUp(self):
        from django.core.management import call_command
        call_command('seed_games', verbosity=0)

        self.client = APIClient()
        self.patient = User.objects.create_user(
            username='progresspatient', password='TestPass123!',
            role='PATIENT', first_name='Progress', last_name='Tester',
        )
        from apps.patients.models import PatientProfile
        PatientProfile.objects.create(user=self.patient)
        self.client.force_authenticate(user=self.patient)

        # Create some sessions
        game = Game.objects.filter(game_type='MEMORY_MATCH').first()
        level = game.levels.first()
        GameSession.objects.create(
            patient=self.patient, game=game, level=level,
            score=80, correct_answers=8, wrong_answers=2,
            accuracy=80, completed=True,
        )

    def test_progress_summary(self):
        response = self.client.get('/api/progress/summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['sessions_count'], 1)
        self.assertGreater(response.data['memory_average'], 0)

    def test_progress_history(self):
        response = self.client.get('/api/progress/history/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_activity_timeline(self):
        response = self.client.get('/api/progress/timeline/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
