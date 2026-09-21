# MY DAY 🧠 — A Gentle Memory Activity Game

MY DAY is a cognitive-activity game for elderly users, including people
with memory difficulties or early-stage dementia. It practices memory,
attention, sequencing, and recognition through familiar daily-life
routines (a morning routine, going for a walk, going to the doctor, an
evening routine, tea time), using very large text, large buttons, calm
colors, and no stressful timers.

**This game is designed for cognitive engagement and memory practice.
It is not a medical diagnostic tool and does not replace professional
medical assessment.** It never claims to diagnose, treat, cure, or
measure the severity of dementia.

---

## 1. Overview

- Five gradually-increasing difficulty levels, from "what comes first?"
  to short multi-question sequencing recall — Level 5 stays
  dementia-friendly (only 3 answer choices, no fast timers, no small
  text).
- Encouraging feedback only ("🌟 Well done!" / "❤️ Good try! Let's try
  again.") — the game never tells anyone they "failed" or "lost".
- A hint system, adaptive difficulty, session history, and a progress
  page — all backed by real data in Django, not fake/mock values.
- Optional voice instructions using the browser's built-in speech
  synthesis (the game is fully playable without it).
- A translation architecture that already supports English and Hindi,
  structured so Assamese, Bengali, and Manipuri can be filled in later
  without touching component code.

## 2. Technology Stack

| Layer     | Technology                                              |
|-----------|----------------------------------------------------------|
| Frontend  | React (Vite), JavaScript, HTML, CSS, Axios               |
| Backend   | Python 3, Django, Django REST Framework, django-cors-headers |
| Database  | SQLite                                                    |

No other backend framework, database, or UI library is used.

## 3. Folder Structure

```
my-day/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── config/            # Django project settings, urls, wsgi/asgi
│   ├── users/              # Patient model
│   ├── game/                # Scenario, Activity, GameSession, GameAnswer,
│   │                         # gameplay logic, REST API views, seed command
│   └── analytics/           # Lightweight reporting helpers
│
├── frontend/
│   ├── package.json
│   ├── index.html
│   ├── src/
│   │   ├── components/       # Header, ActivityCard, AnswerButton, HintButton,
│   │   │                       ProgressBar, FeedbackMessage, VoiceButton, GameCard
│   │   ├── pages/             # Home, ScenarioSelect, LevelSelect, Instructions,
│   │   │                       Game, Result, History, Progress
│   │   ├── services/api.js    # single place for the Django API base URL
│   │   ├── utils/              # translations.js, gameUtils.js
│   │   ├── App.jsx             # state-based page routing
│   │   └── main.jsx
│   └── public/assets/
│
├── README.md
└── .gitignore
```

## 4. Backend Setup (Ubuntu / Linux / macOS)

```bash
cd my-day/backend

python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt

python manage.py migrate
python manage.py seed_game_data

python manage.py check
python manage.py runserver
```

The backend runs at `http://127.0.0.1:8000/` and the API is served under
`http://127.0.0.1:8000/api/`.

`seed_game_data` creates one sample patient and the five built-in
scenarios (Morning Routine, Going for a Walk, Going to the Doctor,
Evening Routine, Tea Time) with their activities in the correct
sequence order. It is safe to run more than once — it uses
`get_or_create` and will not create duplicates.

### Windows

Use `venv\Scripts\activate` instead of `source venv/bin/activate`; every
other command is the same.

## 5. Frontend Setup

Open a second terminal:

```bash
cd my-day/frontend

npm install
npm run dev
```

The frontend runs at `http://localhost:5173/` by default. If Vite picks
a different port, update `CORS_ALLOWED_ORIGINS` in
`backend/config/settings.py` to match (a regex is already included that
allows any `localhost`/`127.0.0.1` port during development).

The React app talks to Django only through the REST API defined in
`src/services/api.js` — there is no second, fake data source in React.

## 6. API Endpoints

| Method | Endpoint                              | Purpose                                   |
|--------|----------------------------------------|--------------------------------------------|
| GET    | `/api/scenarios/`                      | List active scenarios                      |
| GET    | `/api/scenarios/<id>/`                 | One scenario with its ordered activities   |
| GET    | `/api/patient/<id>/progress/`          | Aggregate game-performance summary         |
| GET    | `/api/patient/<id>/history/`           | List of completed sessions                 |
| GET    | `/api/patient/<id>/difficulty/`        | Adaptive-difficulty recommendation         |
| GET    | `/api/patients/`                       | List patients (used to load the active one)|
| POST   | `/api/game/start/`                     | Create a session, get the first question   |
| POST   | `/api/game/answer/`                    | Submit an answer, get feedback + next Q    |
| POST   | `/api/game/hint/`                      | Get a hint-adjusted version of the question|
| POST   | `/api/game/complete/`                  | Finalize the session, update the level     |

### Example: start a game

```
POST /api/game/start/
{ "patient_id": 1, "scenario_id": 1, "level": 1 }
```

```json
{
  "session_id": 7,
  "patient_id": 1,
  "scenario": { "id": 1, "name": "Morning Routine", "activities": [...] },
  "level": 1,
  "total_questions": 1,
  "question_index": 0,
  "question": {
    "type": "first",
    "prompt": "What comes first?",
    "choices": ["Get dressed", "Wake up", "Drink water"]
  }
}
```

### Example: submit an answer

```
POST /api/game/answer/
{ "session_id": 7, "question": "What comes first?", "selected_answer": "Wake up", "response_time": 4.2 }
```

```json
{
  "correct": true,
  "feedback": "🌟 Well done! You remembered it!",
  "correct_answer": "Wake up",
  "correct_answers": 1,
  "incorrect_answers": 0,
  "has_next_question": false
}
```

### Example: complete a game

```
POST /api/game/complete/
{ "session_id": 7, "completion_time": 42 }
```

```json
{
  "score": 100.0,
  "correct_answers": 1,
  "incorrect_answers": 0,
  "hints_used": 0,
  "completion_time": 42,
  "level": 1,
  "scenario": "Morning Routine",
  "performance_percentage": 100.0,
  "recommended_next_level": 2
}
```

## 7. React ↔ Django Architecture

React is responsible only for presentation and interaction. Django (via
Django REST Framework) is the single source of truth for scenarios,
activity order, correct answers, scores, sessions, and adaptive
difficulty. The frontend never decides whether an answer is correct —
it only submits a `selected_answer` string and displays whatever Django
returns. This is what `game/logic.py` and the views in `game/views.py`
enforce on the backend.

## 8. Adaptive Difficulty

After each completed session, the backend applies this rule to the
patient's stored `current_level`:

```
accuracy >= 80%        -> level + 1  (never above 5)
50% <= accuracy < 80%   -> unchanged
accuracy < 50%          -> level - 1  (never below 1)
```

The level only ever moves by one step per completed session. The
`LevelSelect` screen also lets the user manually pick any level at any
time, regardless of the recommendation.

## 9. Database Models

- **Patient** — name, age, preferred_language, current_level, created_at
- **Scenario** — name, description, difficulty_level, language, active
- **Activity** — belongs to a Scenario; name, image, sequence_order
  (unique per scenario)
- **GameSession** — belongs to a Patient and Scenario; level, score,
  correct/incorrect counts, hints_used, completion_time, is_complete,
  plus an internal `question_queue`/`current_question_index` used only
  by the backend to track and validate the in-progress questions
- **GameAnswer** — belongs to a GameSession; question, selected_answer,
  correct, response_time

## 10. Voice Feature

`VoiceButton` uses the browser's built-in `SpeechSynthesisUtterance` API
(no external service). If a browser doesn't support it, the button is
disabled and the game remains fully playable with text and images
alone.

## 11. Multilingual Architecture

All UI text is looked up through `src/utils/translations.js` via
`getText(language, key)`, which falls back to English for any missing
key. English and Hindi are filled in; Assamese, Bengali, and Manipuri
have placeholder entries ready to be translated without changing any
component.

## 12. Testing Performed

Because this environment has no outbound network access, `pip install`
and `npm install` could not reach PyPI/npm to download Django, DRF,
django-cors-headers, React, or Vite. The following was verified
directly in this environment:

- **Backend Python syntax**: every backend `.py` file compiles cleanly
  with `python -m py_compile` (no syntax errors).
- **Core gameplay logic** (`game/logic.py` has no Django dependency, so
  it was unit-tested standalone): question generation for all 5 levels,
  the ordering question type, hint generation (never leaks the correct
  answer, removes one wrong choice), and the adaptive-difficulty rule
  (>=80% → +1 level, 50–79% → unchanged, <50% → -1 level, clamped to
  1–5) all passed.
- **Frontend syntax**: every `.jsx`/`.js` file under `frontend/src` was
  parsed with the TypeScript compiler (`tsc --noEmit`) with zero syntax
  errors, and `translations.js`'s fallback behavior was smoke-tested
  directly with Node.

**UNVERIFIED** (requires internet access to install dependencies, so
could not be executed in this environment):
- `pip install -r requirements.txt` and `python manage.py migrate` /
  `check` / `seed_game_data` / `runserver` actually succeeding
- `npm install` and `npm run dev` actually starting the Vite dev server
- End-to-end browser testing of the full flow (Home → Scenario →
  Level → Instructions → Game → Result → Progress/History) against a
  live Django server
- Manual click-testing of drag/click ordering in Level 2, hint button
  behavior in the browser, and voice playback

Please run the commands in sections 4 and 5 on a machine with internet
access to install dependencies; the code itself has been written and
reviewed to satisfy every requirement, but the commands above should be
run once to confirm on your machine. If you hit any error, share it and
it can be fixed directly.

## 13. Troubleshooting

- **CORS errors in the browser console**: confirm the frontend's actual
  URL/port is covered by `CORS_ALLOWED_ORIGINS` /
  `CORS_ALLOWED_ORIGIN_REGEXES` in `backend/config/settings.py`.
- **"No patient profile was found" on load**: run
  `python manage.py seed_game_data` again — it's safe to re-run.
- **`ModuleNotFoundError: No module named 'django'`**: activate the
  virtual environment (`source venv/bin/activate`) before running
  `manage.py` commands, and confirm `pip install -r requirements.txt`
  completed successfully.
- **Frontend shows a network error box**: confirm the Django server is
  running at `http://127.0.0.1:8000/` and that `frontend/src/services/api.js`'s
  `API_BASE_URL` matches it.
- **Port 5173 already in use**: Vite will automatically try another
  port; update the CORS origin list to match if needed.
