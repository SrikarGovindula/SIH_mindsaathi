from django.core.management.base import BaseCommand
from django.db import transaction

from users.models import Patient
from game.models import Scenario, Activity


SCENARIOS = [
    {
        "name": "Morning Routine",
        "description": "The everyday steps of starting the day.",
        "difficulty_level": 1,
        "activities": [
            "Wake up", "Drink water", "Brush teeth",
            "Get dressed", "Eat breakfast", "Take medicine",
        ],
    },
    {
        "name": "Going for a Walk",
        "description": "Getting ready to go outside for a walk.",
        "difficulty_level": 2,
        "activities": [
            "Get dressed", "Wear shoes", "Take water",
            "Take keys", "Go outside", "Walk",
        ],
    },
    {
        "name": "Going to the Doctor",
        "description": "Preparing for and attending a doctor's visit.",
        "difficulty_level": 4,
        "activities": [
            "Get ready", "Take documents", "Take medicine list",
            "Take water", "Travel", "Meet doctor",
        ],
    },
    {
        "name": "Evening Routine",
        "description": "Winding down at the end of the day.",
        "difficulty_level": 3,
        "activities": [
            "Dinner", "Medicine if scheduled", "Brush teeth",
            "Change clothes", "Go to bed",
        ],
    },
    {
        "name": "Tea Time",
        "description": "Making and enjoying a simple cup of tea.",
        "difficulty_level": 1,
        "activities": [
            "Take cup", "Prepare tea", "Add milk",
            "Sit down", "Drink tea",
        ],
    },
]


class Command(BaseCommand):
    help = "Seed the database with a sample patient and the MY DAY game scenarios. Safe to run multiple times."

    @transaction.atomic
    def handle(self, *args, **options):
        patient, created = Patient.objects.get_or_create(
            name="Sample Patient",
            defaults={
                "age": 72,
                "preferred_language": "en",
                "current_level": 1,
            },
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f"Created sample patient: {patient.name} (id={patient.id})"))
        else:
            self.stdout.write(f"Sample patient already exists (id={patient.id}); skipping creation.")

        for scenario_data in SCENARIOS:
            scenario, scenario_created = Scenario.objects.get_or_create(
                name=scenario_data["name"],
                language="en",
                defaults={
                    "description": scenario_data["description"],
                    "difficulty_level": scenario_data["difficulty_level"],
                    "active": True,
                },
            )
            if scenario_created:
                self.stdout.write(self.style.SUCCESS(f"Created scenario: {scenario.name}"))
            else:
                self.stdout.write(f"Scenario already exists: {scenario.name}; checking activities.")

            for index, activity_name in enumerate(scenario_data["activities"], start=1):
                Activity.objects.get_or_create(
                    scenario=scenario,
                    sequence_order=index,
                    defaults={"name": activity_name, "image": ""},
                )

        self.stdout.write(self.style.SUCCESS("Seed data is ready."))
