
// Vite PWA Service Worker for offline page/app shell caching
const CACHE_NAME = "nyxchat-pwa-v1";
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

// On install: pre-cache core assets
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

// On activate: clean old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Intercept fetch: offline-first for core assets
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request, {ignoreSearch: true}).then(cached => {
      if (cached) return cached;
      return fetch(event.request).catch(() => caches.match("/"));
    })
  );
});
