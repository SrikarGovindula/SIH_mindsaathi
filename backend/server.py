"""
Smriti-NER Backend Synchronization & Clinical Telemetry API
Supports local-first edge sync for remote North-Eastern clinics and PHCs.
Runs with Python standard library (zero external dependencies required)
or with FastAPI if installed.
"""

import json
import os
import sys
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
    return {"sessions": [], "reminders": [], "notes": [], "last_sync": None}

def save_store(data):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

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
            self.wfile.write(json.dumps({"status": "healthy", "service": "Smriti-NER Telemetry Gateway"}).encode('utf-8'))
        elif self.path == '/api/telemetry':
            store = load_store()
            self.send_response(200)
            self._send_cors_headers()
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(store).encode('utf-8'))
        else:
            self.send_response(404)
            self._send_cors_headers()
            self.end_headers()

    def do_POST(self):
        if self.path == '/api/sync':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
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

def run_server():
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, SmritiAPIHandler)
    print(f"[Smriti-NER] Telemetry Server active at http://localhost:{PORT}")
    print("Ready to receive offline telemetry sync packets from rural ASHA tablets.")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
        httpd.server_close()

if __name__ == '__main__':
    run_server()
