self.addEventListener("install", () => {
  console.log("Service Worker installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activated");
  event.waitUntil(self.clients.claim());
});

// ✅ REQUIRED: real fetch handler (not empty)
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});