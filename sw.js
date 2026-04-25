const CACHE = 'lifequest-v1';
const ASSETS = [
  './lifequest_full.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=Nunito:wght@400;600;700;800;900&family=Noto+Sans+JP:wght@400;700&display=swap',
];

// Install: cache core assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first for our assets, network-first for fonts
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Always network for non-GET
  if (e.request.method !== 'GET') return;

  // Cache-first for our own files
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        }).catch(() => caches.match('./lifequest_full.html'));
      })
    );
    return;
  }

  // Network-first for external (fonts, etc)
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
