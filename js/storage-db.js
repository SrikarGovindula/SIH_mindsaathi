/**
 * Smriti-NER Local-First Offline Storage & Sync Engine (IndexedDB)
 * Ensures 100% operational resilience in remote, low-connectivity North-Eastern terrains.
 */

class StorageDB {
    constructor() {
        this.dbName = 'SmritiNER_DB';
        this.dbVersion = 1;
        this.db = null;
        this.isOnline = navigator.onLine;
        this.init();
        this.setupNetworkListeners();
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onupgradeneeded = (e) => {
                const db = e.target.result;

                if (!db.objectStoreNames.contains('sessions')) {
                    const sessionStore = db.createObjectStore('sessions', { keyPath: 'sessionId' });
                    sessionStore.createIndex('gameId', 'gameId', { unique: false });
                    sessionStore.createIndex('startTime', 'startTime', { unique: false });
                }

                if (!db.objectStoreNames.contains('reminders')) {
                    const reminderStore = db.createObjectStore('reminders', { keyPath: 'id' });
                    reminderStore.createIndex('date', 'date', { unique: false });
                }

                if (!db.objectStoreNames.contains('sync_queue')) {
                    db.createObjectStore('sync_queue', { autoIncrement: true });
                }

                if (!db.objectStoreNames.contains('notes')) {
                    db.createObjectStore('notes', { keyPath: 'id', autoIncrement: true });
                }
            };

            request.onsuccess = async (e) => {
                this.db = e.target.result;
                await this.seedHistoricalDataIfEmpty();
                resolve(this.db);
            };

            request.onerror = (e) => {
                console.warn("IndexedDB fallback to memory/localStorage:", e);
                resolve(null);
            };
        });
    }

    setupNetworkListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.updateOnlineBadge(true);
            this.flushSyncQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.updateOnlineBadge(false);
        });
    }

    updateOnlineBadge(online) {
        const badge = document.getElementById('offline-sync-badge');
        if (badge) {
            if (online) {
                badge.className = 'status-badge online';
                badge.innerHTML = '🟢 Online (Synced)';
            } else {
                badge.className = 'status-badge offline';
                badge.innerHTML = '📶 Offline Mode (Saved Locally)';
            }
        }
    }

    async saveSession(sessionData) {
        if (!this.db) {
            let list = JSON.parse(localStorage.getItem('smriti_sessions') || '[]');
            list.push(sessionData);
            localStorage.setItem('smriti_sessions', JSON.stringify(list));
            return;
        }

        try {
            const tx = this.db.transaction(['sessions', 'sync_queue'], 'readwrite');
            tx.objectStore('sessions').put(sessionData);
            tx.objectStore('sync_queue').add({
                type: 'SESSION_TELEMETRY',
                data: sessionData,
                timestamp: Date.now()
            });

            if (this.isOnline) {
                setTimeout(() => this.flushSyncQueue(), 500);
            }
        } catch (e) {
            console.error("Error saving session:", e);
        }
    }

    async getAllSessions() {
        if (!this.db) {
            return JSON.parse(localStorage.getItem('smriti_sessions') || '[]');
        }

        return new Promise((resolve) => {
            try {
                const tx = this.db.transaction('sessions', 'readonly');
                const store = tx.objectStore('sessions');
                const req = store.getAll();
                req.onsuccess = () => resolve(req.result || []);
                req.onerror = () => resolve([]);
            } catch (e) {
                resolve([]);
            }
        });
    }

    async saveReminderLog(reminderLog) {
        if (!this.db) return;
        try {
            const tx = this.db.transaction(['reminders', 'sync_queue'], 'readwrite');
            tx.objectStore('reminders').put(reminderLog);
            tx.objectStore('sync_queue').add({
                type: 'REMINDER_LOG',
                data: reminderLog,
                timestamp: Date.now()
            });
        } catch (e) {
            console.error("Error saving reminder log:", e);
        }
    }

    async getAllReminders() {
        if (!this.db) return [];
        return new Promise((resolve) => {
            try {
                const tx = this.db.transaction('reminders', 'readonly');
                const req = tx.objectStore('reminders').getAll();
                req.onsuccess = () => resolve(req.result || []);
                req.onerror = () => resolve([]);
            } catch (e) {
                resolve([]);
            }
        });
    }

    async flushSyncQueue() {
        if (!this.db || !navigator.onLine) return;
        try {
            const tx = this.db.transaction('sync_queue', 'readwrite');
            const store = tx.objectStore('sync_queue');
            const req = store.getAll();

            req.onsuccess = async () => {
                const items = req.result;
                if (!items || items.length === 0) return;

                // Send to backend API
                try {
                    const res = await fetch('http://localhost:8000/api/sync', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ items: items })
                    });
                    if (res.ok) {
                        const clearTx = this.db.transaction('sync_queue', 'readwrite');
                        clearTx.objectStore('sync_queue').clear();
                        console.log("Telemetry synced successfully with healthcare server!");
                    }
                } catch (netErr) {
                    // Normal in offline/isolated environment, queue persists safely
                    console.log("Offline mode: sync queued locally for next reconnect.");
                }
            };
        } catch (e) {
            console.warn("Sync queue access:", e);
        }
    }

    async seedHistoricalDataIfEmpty() {
        const existing = await this.getAllSessions();
        if (existing.length > 0) return;

        const baseTime = Date.now();
        const oneDay = 86400000;

        const sampleHistory = [
            {
                sessionId: 'SESS-HIST-01',
                gameId: 'memory-match',
                level: 1,
                startTime: baseTime - (6 * oneDay),
                durationSeconds: 120,
                avgReactionTime: 3200,
                accuracy: 85,
                hintsGiven: 1,
                hesitationsDetected: 2,
                completed: true
            },
            {
                sessionId: 'SESS-HIST-02',
                gameId: 'tea-garden',
                level: 1,
                startTime: baseTime - (5 * oneDay),
                durationSeconds: 90,
                avgReactionTime: 2800,
                accuracy: 90,
                hintsGiven: 0,
                hesitationsDetected: 1,
                completed: true
            },
            {
                sessionId: 'SESS-HIST-03',
                gameId: 'routine-sequence',
                level: 1,
                startTime: baseTime - (4 * oneDay),
                durationSeconds: 140,
                avgReactionTime: 3400,
                accuracy: 80,
                hintsGiven: 2,
                hesitationsDetected: 2,
                completed: true
            },
            {
                sessionId: 'SESS-HIST-04',
                gameId: 'pattern-weave',
                level: 1,
                startTime: baseTime - (3 * oneDay),
                durationSeconds: 110,
                avgReactionTime: 2900,
                accuracy: 88,
                hintsGiven: 1,
                hesitationsDetected: 1,
                completed: true
            },
            {
                sessionId: 'SESS-HIST-05',
                gameId: 'memory-match',
                level: 2,
                startTime: baseTime - (2 * oneDay),
                durationSeconds: 135,
                avgReactionTime: 2600,
                accuracy: 92,
                hintsGiven: 0,
                hesitationsDetected: 0,
                completed: true
            },
            {
                sessionId: 'SESS-HIST-06',
                gameId: 'tea-garden',
                level: 2,
                startTime: baseTime - (1 * oneDay),
                durationSeconds: 105,
                avgReactionTime: 2450,
                accuracy: 94,
                hintsGiven: 0,
                hesitationsDetected: 1,
                completed: true
            }
        ];

        try {
            const tx = this.db.transaction('sessions', 'readwrite');
            const store = tx.objectStore('sessions');
            for (const s of sampleHistory) {
                store.put(s);
            }
        } catch (e) {}
    }
}

window.storageDB = new StorageDB();
