# Smriti-NER (স্মৃতি-NER)
## AI-Based Cognitive Gaming & Memory Assistance Platform for Elderly Dementia Patients in the North Eastern Region (NER)

---

### Overview
**Smriti-NER** is a culturally-rooted, AI-enabled, local-first digital therapeutics and memory assistance platform designed for elderly individuals living with mild cognitive impairment (MCI) and dementia across North-East India.

The platform addresses the acute shortage of specialized geriatric neurological care in remote and rural terrains of the 8 North-Eastern states by delivering:
1. **Culturally Inclusive Cognitive Stimulation Therapy (CST)**: 5 specialized cognitive games rooted in North-Eastern heritage (Jaapi, Bihu Dhol, Assam tea gardens, Majuli masks, Loktak Sangai, Gamusa weaves, and indigenous fruits).
2. **CogniAdapt AI Engine**: Non-punitive reinforcement-learning inspired staircase algorithm that continuously assesses reaction time, hesitation pauses (>5s), and errors to dynamically adapt difficulty and inject dignity-preserving multimodal cues.
3. **Multilingual & Voice Assistant ("Aai / Baideo Companion")**: Native language interaction supporting 8 languages (Assamese, Bengali, Bodo, Meitei/Manipuri, Mizo, Khasi, Hindi, English).
4. **Smart Elderly Reminders**: Visual and spoken reminders for medications, hydration tracking (water glass logging), daily walks, and PHC doctor appointments.
5. **Caregiver & Rural ASHA / PHC Dashboard**: Longitudinal cognitive tracking across 5 domains (Memory, Attention, Routine, Executive, Visuospatial), early cognitive decline alert detection, and exportable MoCA/MMSE clinical reports.
6. **Local-First & Offline Resilience (PWA)**: 100% operational offline via IndexedDB and Service Worker caching, with an offline synchronization queue that automatically uploads telemetry to community healthcare servers when connectivity resumes.

---

### Core Architecture & Components

```
ner-dementia-care/
├── index.html                   # Main Patient Application Shell & Voice Companion
├── caregiver.html               # Dedicated ASHA Health Worker & Caregiver Clinical Portal
├── manifest.json                # PWA Progressive Web App Manifest
├── sw.js                        # Service Worker for 100% Offline Capability
├── css/
│   ├── elderly-theme.css        # High contrast, large typography, comforting NER palette
│   ├── games.css                # Cognitive game animations and cards
│   └── caregiver.css            # Caregiver charts, tables, and alert badges
├── js/
│   ├── app.js                   # Navigation, state management & audio synthesis
│   ├── i18n.js                  # Multilingual translations (8 Regional Languages)
│   ├── voice-assistant.js       # Speech synthesis & Web Audio harmonic flute synthesizer
│   ├── cogni-adapt-engine.js    # AI/ML dynamic difficulty & cognitive state estimation
│   ├── storage-db.js            # IndexedDB local storage & offline synchronization queue
│   ├── reminders.js             # Medicine, hydration, and appointment reminder engine
│   ├── games/
│   │   ├── memory-match.js      # Game 1: NER Cultural Artifacts Match & Reminiscence
│   │   ├── tea-garden.js        # Game 2: Cha Bagan Attention & Concentration
│   │   ├── routine-sequence.js  # Game 3: Daily Routine Recall Sequencer
│   │   ├── pattern-weave.js     # Game 4: Weave Pattern & Indigenous Fruit Recognition
│   │   └── calm-breathing.js    # Game 5: Monor Xanti Emotional Well-being & Flute
│   └── caregiver-dashboard.js   # Analytics, charts, cognitive radar, clinical export
└── backend/
    ├── server.py                # Python Telemetry & Clinical Sync API Server
    └── telemetry_store.json     # Edge telemetry store
```

---

### Running the Platform

#### Method 1: Instant Browser Launch (No installation required)
Simply open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari) on your PC, tablet, or smartphone.
To view the Caregiver & ASHA Clinical Portal, open `caregiver.html` or click the "Caregiver" tab.

#### Method 2: Local HTTP Server with Sync Backend
1. In the terminal, start the Python telemetry backend:
   ```bash
   python backend/server.py
   ```
2. In another terminal or browser, serve the frontend:
   ```bash
   python -m http.server 3000
   ```
3. Open `http://localhost:3000` to interact with the full system.
