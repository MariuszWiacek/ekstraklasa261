self.addEventListener("install", () => {
  console.log("SW installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("SW activated");
  event.waitUntil(self.clients.claim());
});

// IMPORTANT: DO NOTHING WITH FETCH (prevents breaking app)
self.addEventListener("fetch", () => {});