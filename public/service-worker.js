self.addEventListener("install", () => {
  console.log("Service Worker installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activated");
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // ✅ Only handle GET requests (important!)
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request).catch(() => {
      // fallback if offline
      return new Response("Offline", {
        status: 503,
        statusText: "Offline",
      });
    })
  );
});