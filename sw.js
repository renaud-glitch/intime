const CACHE_NAME = 'mon-journal-v3';
const ASSETS = [
  './',
  './index.html',
  './icon.png',
  './manifest.json'
];

// Installation : on met en cache les ressources essentielles
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // Active immédiatement sans attendre
});

// Activation : supprime les anciens caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim(); // Prend le contrôle immédiatement
});

// Fetch : réseau en priorité, cache en fallback
self.addEventListener('fetch', e => {
  // Pour index.html : toujours le réseau, jamais le cache
  if (e.request.url.endsWith('index.html') || e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Pour le reste : cache en priorité (icônes, manifest)
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
