/* eslint-disable no-restricted-globals */
const CACHE_NAME = 'ekstrabet-cache-v1';
const urlsToCache = ['/'];

// Install SW
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// Activate SW
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// REQUIRED FOR INSTALL BUTTON: Fetch handler
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
