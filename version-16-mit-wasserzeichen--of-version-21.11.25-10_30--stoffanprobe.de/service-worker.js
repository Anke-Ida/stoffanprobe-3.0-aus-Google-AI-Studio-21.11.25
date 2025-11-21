const CACHE_NAME = "stoffanprobe-v1";

const OFFLINE_URLS = [
  "/", 
  "/index.html",
  "/index.css",
  "/index.tsx",
  "/App.tsx",
  "/manifest.json",
  "/pwa-192x192.png",
  "/pwa-512x512.png",
];

// Install SW
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

// Activate SW
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch handler
self.addEventListener("fetch", (event) => {
  const request = event.request;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).catch(() => {
        // Offline fallback für Navigation
        if (request.mode === "navigate") {
          return caches.match("/index.html");
        }
      });
    })
  );
});
