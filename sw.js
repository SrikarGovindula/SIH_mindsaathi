/**
 * Smriti-NER Service Worker
 * Provides offline caching for all assets, scripts, and fonts in remote NER regions.
 */

const CACHE_NAME = 'smriti-ner-v1';
const ASSETS = [
    './',
    './index.html',
    './caregiver.html',
    './manifest.json',
    './css/elderly-theme.css',
    './css/games.css',
    './css/caregiver.css',
    './js/app.js',
    './js/i18n.js',
    './js/cogni-adapt-engine.js',
    './js/storage-db.js',
    './js/voice-assistant.js',
    './js/reminders.js',
    './js/caregiver-dashboard.js',
    './js/games/memory-match.js',
    './js/games/tea-garden.js',
    './js/games/routine-sequence.js',
    './js/games/pattern-weave.js',
    './js/games/calm-breathing.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Caching offline shell & games for remote NER usage');
            return cache.addAll(ASSETS).catch((err) => {
                console.warn('Cache pre-fetch partial notice:', err);
            });
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Cache first, fallback to network
    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return fetch(event.request).then((response) => {
                // If valid response, clone and put into cache
                if (response && response.status === 200 && response.type === 'basic') {
                    const respClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, respClone);
                    });
                }
                return response;
            }).catch(() => {
                // If offline and request is for navigation, return cached index.html
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
