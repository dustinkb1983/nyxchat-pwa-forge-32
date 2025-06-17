
// Enhanced PWA Service Worker for NyxChat
const CACHE_NAME = "nyxchat-pwa-v2";
const STATIC_CACHE = "nyxchat-static-v2";
const DYNAMIC_CACHE = "nyxchat-dynamic-v2";

const CORE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

// Install event - cache core assets
self.addEventListener("install", event => {
  console.log("Service Worker: Installing...");
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log("Service Worker: Caching core assets");
      return cache.addAll(CORE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener("activate", event => {
  console.log("Service Worker: Activating...");
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log("Service Worker: Clearing old cache", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(event.request).then(networkResponse => {
        // Don't cache API calls or external resources
        if (event.request.url.includes('api') || 
            !event.request.url.startsWith(self.location.origin)) {
          return networkResponse;
        }
        
        // Cache successful responses
        if (networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        
        return networkResponse;
      }).catch(() => {
        // Offline fallback
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      });
    })
  );
});

// Background sync for offline messages (future enhancement)
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
  }
});
