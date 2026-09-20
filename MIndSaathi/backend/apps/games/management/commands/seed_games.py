"""
Idempotent seed command: creates 3 games × 10 levels with progressive difficulty.
Running twice will not create duplicates.
"""

from django.core.management.base import BaseCommand

from apps.games.models import Game, GameLevel


GAMES_CONFIG = [
    {
        'name': 'Memory Match',
        'game_type': Game.GameType.MEMORY_MATCH,
        'description': 'Test your memory by matching objects shown briefly on screen.',
        'icon': '🧩',
        'levels': [
            # level_number: {num_items, display_time_sec, num_distractors}
            {'level_number': 1,  'config': {'num_items': 3,  'display_time': 10, 'num_distractors': 2, 'grid_size': 4}},
            {'level_number': 2,  'config': {'num_items': 4,  'display_time': 9,  'num_distractors': 2, 'grid_size': 4}},
            {'level_number': 3,  'config': {'num_items': 4,  'display_time': 8,  'num_distractors': 3, 'grid_size': 6}},
            {'level_number': 4,  'config': {'num_items': 5,  'display_time': 8,  'num_distractors': 3, 'grid_size': 6}},
            {'level_number': 5,  'config': {'num_items': 5,  'display_time': 7,  'num_distractors': 4, 'grid_size': 8}},
            {'level_number': 6,  'config': {'num_items': 6,  'display_time': 7,  'num_distractors': 4, 'grid_size': 8}},
            {'level_number': 7,  'config': {'num_items': 7,  'display_time': 6,  'num_distractors': 5, 'grid_size': 9}},
            {'level_number': 8,  'config': {'num_items': 8,  'display_time': 5,  'num_distractors': 5, 'grid_size': 9}},
            {'level_number': 9,  'config': {'num_items': 9,  'display_time': 5,  'num_distractors': 6, 'grid_size': 12}},
            {'level_number': 10, 'config': {'num_items': 10, 'display_time': 4,  'num_distractors': 6, 'grid_size': 12}},
        ],
    },
    {
        'name': 'Pattern & Sequence',
        'game_type': Game.GameType.PATTERN_SEQUENCE,
        'description': 'Find the next element in a color or shape pattern.',
        'icon': '🔢',
        'levels': [
            {'level_number': 1,  'config': {'sequence_length': 3, 'num_colors': 2, 'num_options': 2, 'time_limit': 30}},
            {'level_number': 2,  'config': {'sequence_length': 3, 'num_colors': 2, 'num_options': 3, 'time_limit': 28}},
            {'level_number': 3,  'config': {'sequence_length': 4, 'num_colors': 3, 'num_options': 3, 'time_limit': 26}},
            {'level_number': 4,  'config': {'sequence_length': 4, 'num_colors': 3, 'num_options': 4, 'time_limit': 24}},
            {'level_number': 5,  'config': {'sequence_length': 5, 'num_colors': 3, 'num_options': 4, 'time_limit': 22}},
            {'level_number': 6,  'config': {'sequence_length': 5, 'num_colors': 4, 'num_options': 4, 'time_limit': 20}},
            {'level_number': 7,  'config': {'sequence_length': 6, 'num_colors': 4, 'num_options': 5, 'time_limit': 18}},
            {'level_number': 8,  'config': {'sequence_length': 6, 'num_colors': 5, 'num_options': 5, 'time_limit': 16}},
            {'level_number': 9,  'config': {'sequence_length': 7, 'num_colors': 5, 'num_options': 6, 'time_limit': 14}},
            {'level_number': 10, 'config': {'sequence_length': 8, 'num_colors': 6, 'num_options': 6, 'time_limit': 12}},
        ],
    },
    {
        'name': 'Daily Recall',
        'game_type': Game.GameType.DAILY_RECALL,
        'description': 'Remember and recall objects shown to you.',
        'icon': '💡',
        'levels': [
            {'level_number': 1,  'config': {'num_objects': 3, 'display_time': 10, 'num_questions': 3, 'time_limit': 30}},
            {'level_number': 2,  'config': {'num_objects': 3, 'display_time': 9,  'num_questions': 3, 'time_limit': 28}},
            {'level_number': 3,  'config': {'num_objects': 4, 'display_time': 8,  'num_questions': 4, 'time_limit': 26}},
            {'level_number': 4,  'config': {'num_objects': 4, 'display_time': 8,  'num_questions': 4, 'time_limit': 24}},
            {'level_number': 5,  'config': {'num_objects': 5, 'display_time': 7,  'num_questions': 5, 'time_limit': 22}},
            {'level_number': 6,  'config': {'num_objects': 5, 'display_time': 7,  'num_questions': 5, 'time_limit': 20}},
            {'level_number': 7,  'config': {'num_objects': 6, 'display_time': 6,  'num_questions': 6, 'time_limit': 18}},
            {'level_number': 8,  'config': {'num_objects': 7, 'display_time': 5,  'num_questions': 6, 'time_limit': 16}},
            {'level_number': 9,  'config': {'num_objects': 8, 'display_time': 5,  'num_questions': 7, 'time_limit': 14}},
            {'level_number': 10, 'config': {'num_objects': 10, 'display_time': 4, 'num_questions': 8, 'time_limit': 12}},
        ],
    },
]


class Command(BaseCommand):
    help = 'Seed the database with 3 games and 10 levels each (idempotent)'

    def handle(self, *args, **options):
        for game_data in GAMES_CONFIG:
            levels = game_data.pop('levels')

            game, created = Game.objects.update_or_create(
                game_type=game_data['game_type'],
                defaults={
                    'name': game_data['name'],
                    'description': game_data['description'],
                    'icon': game_data['icon'],
                    'is_active': True,
                },
            )
            action = 'Created' if created else 'Updated'
            self.stdout.write(f'  {action} game: {game.name}')

            for level_data in levels:
                level, l_created = GameLevel.objects.update_or_create(
                    game=game,
                    level_number=level_data['level_number'],
                    defaults={'config': level_data['config']},
                )
                if l_created:
                    self.stdout.write(f'    Created level {level.level_number}')

            # Re-add levels key for potential re-runs
            game_data['levels'] = levels

        self.stdout.write(self.style.SUCCESS(
            f'Done! {Game.objects.count()} games, {GameLevel.objects.count()} levels.'
        ))
