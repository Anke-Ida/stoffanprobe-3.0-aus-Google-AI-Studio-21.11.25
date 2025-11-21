const CACHE_NAME = "stoffanprobe-v1";

// WICHTIG: Hier nur Dateien listen, die es WIRKLICH im 'public' Ordner gibt.
// Keine .tsx oder .ts Dateien, die existieren im Browser nicht mehr!
const OFFLINE_URLS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/pwa-192x192.png",
  "/pwa-512x512.png"
];

// Installieren: Cache öffnen und Dateien laden
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

// Aktivieren: Alte Caches aufräumen
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

// Fetch: Intelligent laden (Deine gute Logik)
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Nur GET-Requests cachen
  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then((cached) => {
      // 1. Wenn im Cache, dann nimm es
      if (cached) return cached;

      // 2. Wenn nicht, hol es aus dem Netz
      return fetch(request).catch(() => {
        // 3. Wenn Netz weg ist UND es eine Navigation ist (User lädt Seite neu)
        // dann zeige die Startseite aus dem Cache (Fallback)
        if (request.mode === "navigate") {
          return caches.match("/index.html");
        }
      });
    })
  );
});
