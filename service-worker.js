const CACHE_NAME = 'clinic-pay-v6';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './css/components.css',
  './css/responsive.css',
  './js/supabase-config.js',
  './js/supabase-client.js',
  './js/services/user-service.js',
  './js/services/mri-service.js',
  './js/services/investigation-service.js',
  './js/services/operation-service.js',
  './js/storage.js',
  './js/validation.js',
  './js/auth.js',
  './js/calculations.js',
  './js/language.js',
  './js/ui.js',
  './js/navigation.js',
  './js/pwa.js',
  './js/app.js',
  './assets/icons/clinic-logo.svg',
  './assets/icons/icon-192.svg',
  './assets/icons/icon-512.svg'
];

// Install Event - Precache Application Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Stale-While-Revalidate Strategy for offline resilience
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Cache newly fetched valid asset if within our origin
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Return cached version or fallback offline response
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
