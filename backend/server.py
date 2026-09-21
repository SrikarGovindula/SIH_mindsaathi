"""
Smriti-NER Backend Synchronization & Clinical Telemetry API
Supports local-first edge sync for remote North-Eastern clinics and PHCs.
Runs with Python standard library (zero external dependencies required)
or with FastAPI if installed.

New endpoints (AI Caretaker Edition):
  POST /api/ai-chat   — Offline intent classification + response selection
  POST /api/alert     — Log caregiver escalation events
"""

import json
import os
import sys
import random
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

PORT = 8000
DATA_FILE = os.path.join(os.path.dirname(__file__), 'telemetry_store.json')

def load_store():
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return {"sessions": [], "reminders": [], "notes": [], "alerts": [], "last_sync": None}

def save_store(data):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# ─────────────────────────────────────────────────────────────────
#  Offline AI Intent Classifier
#  Mirrors the client-side logic for server-side validation/logging
# ─────────────────────────────────────────────────────────────────

INTENT_KEYWORDS = {
    "pain":         ["pain", "hurt", "ache", "fell", "fall", "injured", "biju", "bejaa", "na", "naabi", "bijaab"],
    "hunger":       ["hungry", "food", "eat", "meal", "rice", "thirsty", "bhok", "khaabo", "bhaat", "bhukkh"],
    "medicine":     ["medicine", "tablet", "pill", "drug", "darob", "oshudh", "dawai", "damdawi", "hiidak"],
    "toilet":       ["toilet", "bathroom", "washroom", "potty", "bathruum", "shauchaalay"],
    "confusion":    ["where", "who", "what", "don't know", "lost", "confused", "kot", "ke", "ki", "hera"],
    "family":       ["son", "daughter", "wife", "husband", "mother", "father", "family", "ma", "baba", "chhangkua"],
    "memory_lapse": ["forgot", "forget", "remember", "can't", "memory", "paahori", "mone nai", "yaad nahi"],
    "game_help":    ["game", "play", "puzzle", "match", "activity", "khel", "infiam", "shannpot"],
    "calm_request": ["calm", "breathe", "relax", "peace", "anxious", "worried", "shaanti", "thlamuang"],
    "greeting":     ["hello", "hi", "namaste", "good morning", "chibai", "khublei"],
}

FALLBACK_RESPONSES = {
    "en": {
        "pain":         "I'm getting help for you right away.",
        "hunger":       "It's time to eat. Your caregiver will bring food.",
        "medicine":     "Time to take your medicine with some water.",
        "toilet":       "I'll help you to the bathroom.",
        "confusion":    "You are safe. I'm right here with you.",
        "family":       "Your family loves you and they'll be here soon.",
        "memory_lapse": "That's perfectly okay. You're safe and we're together.",
        "game_help":    "Let's play a cognitive game together!",
        "calm_request": "Let's breathe slowly together. In... and out...",
        "greeting":     "Hello dear! How are you feeling today?",
        "unknown":      "I'm listening. Could you say that again?"
    }
}

def classify_intent(text: str) -> str:
    text_lower = text.lower()
    for intent, keywords in INTENT_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            return intent
    return "unknown"

def get_fallback_response(intent: str, lang: str = "en") -> str:
    lang_responses = FALLBACK_RESPONSES.get(lang, FALLBACK_RESPONSES["en"])
    return lang_responses.get(intent, lang_responses.get("unknown", "I'm here with you."))


class SmritiAPIHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        if self.path == '/api/health':
            self.send_response(200)
            self._send_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "healthy",
                "service": "Smriti-NER AI Caretaker Gateway",
                "version": "2.0",
                "features": ["ai-chat", "telemetry", "alerts", "offline-sync"]
            }).encode('utf-8'))

        elif self.path == '/api/telemetry':
            store = load_store()
            self.send_response(200)
            self._send_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(store).encode('utf-8'))

        elif self.path == '/api/prescriptions':
            store = load_store()
            rx_list = store.get('prescriptions', [])
            self.send_response(200)
            self._send_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(rx_list).encode('utf-8'))

        else:
            self.send_response(404)
            self._send_cors_headers()
            self.end_headers()

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)

        # ── AI Chat Endpoint ──────────────────────────────────────────
        if self.path == '/api/ai-chat':
            try:
                payload = json.loads(body.decode('utf-8'))
                user_text = payload.get('text', '')
                lang = payload.get('lang', 'en')
                context = payload.get('context_history', [])

                intent = classify_intent(user_text)
                response_text = get_fallback_response(intent, lang)

                # Check escalation
                distress_words = ["pain", "hurt", "fell", "fall", "help", "emergency",
                                  "biju", "na", "bijaab", "naabi", "tla"]
                escalate = any(w in user_text.lower() for w in distress_words)

                # Log conversation to store
                store = load_store()
                store.setdefault('ai_conversations', []).append({
                    "ts": datetime.utcnow().isoformat(),
                    "lang": lang,
                    "user_text": user_text,
                    "intent": intent,
                    "response": response_text,
                    "escalated": escalate
                })
                save_store(store)

                self.send_response(200)
                self._send_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    "intent": intent,
                    "response": response_text,
                    "escalate": escalate,
                    "lang": lang
                }).encode('utf-8'))

            except Exception as e:
                self.send_response(400)
                self._send_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))

        # ── Alert Logging Endpoint ────────────────────────────────────
        elif self.path == '/api/alert':
            try:
                payload = json.loads(body.decode('utf-8'))
                store = load_store()
                alert_record = {
                    "ts": datetime.utcnow().isoformat(),
                    "type": payload.get('type', 'unknown'),
                    "message": payload.get('message', ''),
                    "lang": payload.get('lang', 'en')
                }
                store.setdefault('alerts', []).append(alert_record)
                save_store(store)

                print(f"[ALERT] {alert_record['type'].upper()}: {alert_record['message']}")

                self.send_response(200)
                self._send_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "logged"}).encode('utf-8'))

            except Exception as e:
                self.send_response(400)
                self._send_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))

        # ── Telemetry Sync Endpoint ───────────────────────────────────
        elif self.path == '/api/sync':
            try:
                payload = json.loads(body.decode('utf-8'))
                items = payload.get('items', [])
                store = load_store()

                for item in items:
                    item_type = item.get('type')
                    data = item.get('data')
                    if item_type == 'SESSION_TELEMETRY':
                        store['sessions'].append(data)
                    elif item_type == 'REMINDER_LOG':
                        store['reminders'].append(data)

                store['last_sync'] = datetime.utcnow().isoformat()
                save_store(store)

                self.send_response(200)
                self._send_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "synced", "received_count": len(items)}).encode('utf-8'))

            except Exception as e:
                self.send_response(400)
                self._send_cors_headers()
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))

        else:
            self.send_response(404)
            self._send_cors_headers()
            self.end_headers()

    def log_message(self, format, *args):
        # Suppress default request logs unless DEBUG
        if os.environ.get('DEBUG'):
            super().log_message(format, *args)


def run_server():
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, SmritiAPIHandler)
    print(f"[Smriti-NER] AI Caretaker Gateway active at http://localhost:{PORT}")
    print("[Smriti-NER] Endpoints: /api/health  /api/ai-chat  /api/alert  /api/sync  /api/telemetry")
    print("Ready to receive offline telemetry sync packets from rural ASHA tablets.")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
        httpd.server_close()


if __name__ == '__main__':
    run_server()

