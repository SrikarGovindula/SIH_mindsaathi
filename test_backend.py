import sys
import os
import time
import json
import threading
import urllib.request
from http.server import HTTPServer

# Add current dir to path
sys.path.insert(0, os.path.dirname(__file__))
from backend.server import SmritiAPIHandler, PORT

def test_api():
    server = HTTPServer(('127.0.0.1', 8080), SmritiAPIHandler)
    t = threading.Thread(target=server.serve_forever, daemon=True)
    t.start()
    time.sleep(0.5)

    # 1. Test Health
    with urllib.request.urlopen("http://127.0.0.1:8080/api/health") as res:
        health_data = json.loads(res.read().decode())
        print("Health Check:", health_data)
        assert health_data["status"] == "healthy"

    # 2. Test Sync
    sync_payload = json.dumps({
        "items": [
            {
                "type": "SESSION_TELEMETRY",
                "data": {"sessionId": "TEST-123", "gameId": "memory-match", "accuracy": 95}
            },
            {
                "type": "REMINDER_LOG",
                "data": {"id": "REM-123", "type": "medication", "status": "taken"}
            }
        ]
    }).encode("utf-8")

    req = urllib.request.Request(
        "http://127.0.0.1:8080/api/sync",
        data=sync_payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as res:
        sync_res = json.loads(res.read().decode())
        print("Sync Endpoint:", sync_res)
        assert sync_res["status"] == "synced"
        assert sync_res["received_count"] == 2

    # 3. Test Telemetry Retrieve
    with urllib.request.urlopen("http://127.0.0.1:8080/api/telemetry") as res:
        telemetry_data = json.loads(res.read().decode())
        print("Telemetry Store:", len(telemetry_data["sessions"]), "sessions recorded")
        assert len(telemetry_data["sessions"]) >= 1

    server.shutdown()
    print("ALL API ENDPOINTS TESTED AND PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_api()
