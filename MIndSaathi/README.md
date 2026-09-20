# MindSaathi — Elderly Cognitive Activity & Patient Monitoring Platform

MindSaathi is a full-stack web application designed for cognitive stimulation and health monitoring of elderly individuals. It connects **Patients**, **Caretakers**, and **Doctors** in a unified platform featuring 3 deterministic cognitive games (10 levels each), real-time performance analytics, multi-caretaker invitation system, doctor-patient linkage, and append-only clinical/caretaker observation notes.

---

## 🚀 Tech Stack

### Backend
* **Language & Framework**: Python 3.14+, Django 6.1, Django REST Framework
* **Database**: PostgreSQL 16 (via `psycopg` 3)
* **Authentication**: JWT with `djangorestframework-simplejwt`
* **CORS**: `django-cors-headers`
* **Configuration**: `python-dotenv`

### Frontend
* **Core**: React 19, Vite 8 (JavaScript)
* **Routing**: React Router DOM v7
* **HTTP Client**: Axios with automatic JWT interceptors & token refresh
* **UI/UX**: Custom responsive CSS with elderly-accessible design (large touch targets >= 56px, 18px+ typography, high-contrast palette)

---

## 📁 Project Structure

```text
MindSaathi/
│
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env
│   │
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   │
│   └── apps/
│       ├── accounts/       # Custom User model (Patient, Caretaker, Doctor) & JWT auth
│       ├── patients/       # Patient profiles & patient dashboard metrics
│       ├── caretakers/     # Caretaker profiles, invitation codes & relationship management
│       ├── doctors/        # Doctor profiles, registration & patient connection requests
│       ├── games/          # 3 Cognitive Games (Memory, Pattern, Recall), 30 levels & scoring
│       ├── progress/       # Performance summaries, history & activity timelines
│       ├── notes/          # Caretaker observations & Doctor clinical notes
│       └── notifications/  # Notification handlers (ready for push notification expansion)
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── .env
│   │
│   └── src/
│       ├── api/            # Central Axios client & domain API services
│       ├── components/     # Protected routes, role guards, accessible charts & spinners
│       ├── context/        # AuthContext for role-based session lifecycle
│       ├── layouts/        # Distinct Patient, Caretaker, and Doctor navigation layouts
│       ├── pages/          # Auth, Patient portal, Caretaker portal, Doctor portal
│       ├── routes/         # AppRouter with nested protected routes
│       └── index.css       # High-contrast, accessible global design system
│
├── .gitignore
└── README.md
```

---

## 👥 User Roles & Portals

1. **Patient (`PATIENT`)**:
   * Friendly, high-contrast elderly UI
   * Play 3 cognitive games across 10 progressive levels:
     * **Memory Match** (Recall shown objects after delay)
     * **Pattern & Sequence** (Concentration & pattern completion)
     * **Daily Recall** (Object recognition and verification)
   * Track performance metrics (normalized 0–100 scores, accuracy %, response times)
   * Generate 8-character invitation codes for family/professional caretakers
   * Accept or decline doctor connection requests

2. **Caretaker (`CARETAKER`)**:
   * Activate account via unique patient invitation code
   * Multi-patient monitoring dashboard
   * View patient activity timelines and game performance trends
   * Log observational notes (e.g. daily mood, fatigue) visible to authorized doctors

3. **Doctor (`DOCTOR`)**:
   * Register with medical registration number, hospital, and specialization
   * Search and connect with patients
   * Access detailed cognitive activity histories, performance charts, and caretaker observations
   * Record clinical history notes per patient

---

## ⚙️ Prerequisites

* Python 3.10+
* Node.js 18+ and npm
* PostgreSQL 16+ running locally or remotely

---

## 🛠️ Setup Instructions

### 1. Database Setup (PostgreSQL)

Ensure PostgreSQL service is running and create the database:

```bash
# Using createdb or psql:
createdb -U postgres mindsaathi_db
```

### 2. Backend Setup

```bash
cd backend

# (Optional) Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure Environment Variables
# Create backend/.env with the following:
SECRET_KEY=your-secure-django-secret-key
DEBUG=True
DB_NAME=mindsaathi_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432

# Apply database migrations
python manage.py migrate

# Seed 3 Games and 30 Levels (Idempotent)
python manage.py seed_games

# (Optional) Create superuser for Django Admin
python manage.py createsuperuser
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Configure Environment Variables
# Ensure frontend/.env contains:
VITE_API_URL=http://localhost:8000/api

# Build for production
npm run build
```

---

## 🏃 Running the Application

### Start Backend Server
```bash
cd backend
python manage.py runserver 8000
```
API Root: `http://localhost:8000/api/`  
Admin Panel: `http://localhost:8000/admin/`

### Start Frontend Dev Server
```bash
cd frontend
npm run dev
```
Frontend App: `http://localhost:5173/`

---

## 🧪 Running Automated Tests

The test suite validates authentication, role-based authorization, multi-caretaker invitation flows, doctor-patient linkage, game level seeding, and deterministic scoring calculations.

```bash
cd backend
python manage.py test apps.accounts.tests apps.games.tests apps.caretakers.tests
```

---

## 🔒 Security & Medical Disclaimers

* **Deterministic Metrics**: Game scores are performance and activity indicators (0–100 scale), **not** clinical dementia or medical diagnostic scores.
* **Server-Side Authorization**: Doctors and Caretakers can only access data for patients explicitly linked to their accounts. Patients can only access their own records.
* **Token Security**: Passwords are securely hashed with PBKDF2/SHA256. JWT access/refresh tokens are verified on every protected API endpoint.
