
// Enhanced PWA Service Worker for NyxChat v4 - Mobile Optimized
const CACHE_NAME = "nyxchat-pwa-v4";
const STATIC_CACHE = "nyxchat-static-v4";
const DYNAMIC_CACHE = "nyxchat-dynamic-v4";
const IMAGE_CACHE = "nyxchat-images-v4";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./lovable-uploads/2fe14165-cccc-44c9-a268-7ab4c910b4d8.png",
  "./lovable-uploads/f1345f48-4cf9-47e5-960c-3b6d62925c7f.png"
];

// Install event - cache core assets
self.addEventListener("install", event => {
  console.log("Service Worker: Installing v4...");
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log("Service Worker: Caching core assets");
      return Promise.allSettled(
        CORE_ASSETS.map(asset => cache.add(asset))
      );
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener("activate", event => {
  console.log("Service Worker: Activating v4...");
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheName.includes("v4")) {
            console.log("Service Worker: Clearing old cache", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Enhanced fetch event with mobile-optimized caching
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  
  const url = new URL(event.request.url);
  
  // Skip cross-origin requests that aren't images or fonts
  if (url.origin !== self.location.origin && !isStaticResource(event.request)) {
    return;
  }

  event.respondWith(handleFetch(event.request));
});

async function handleFetch(request) {
  try {
    // Cache first for static assets
    if (isStaticAsset(request)) {
      return await cacheFirst(request, STATIC_CACHE);
    }
    
    // Cache first for images and fonts
    if (isStaticResource(request)) {
      return await cacheFirst(request, IMAGE_CACHE);
    }
    
    // Network first for everything else with offline fallback
    return await networkFirstWithFallback(request);
    
  } catch (error) {
    console.warn("Service Worker: Fetch failed", error);
    return await handleOfflineFallback(request);
  }
}

// Cache strategies
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return cached || new Response('Offline', { status: 503 });
  }
}

async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cached = await cache.match(request);
    return cached || await handleOfflineFallback(request);
  }
}

async function handleOfflineFallback(request) {
  if (request.destination === 'document') {
    const cache = await caches.open(STATIC_CACHE);
    return cache.match('./') || new Response('Offline', { status: 503 });
  }
  
  return new Response('Offline', { status: 503 });
}

// Helper functions
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.includes('.js') || 
         url.pathname.includes('.css') || 
         url.pathname === './' ||
         url.pathname === './index.html' ||
         url.pathname === './manifest.json';
}

function isStaticResource(request) {
  return request.destination === 'image' || 
         request.destination === 'font' ||
         request.url.includes('.png') ||
         request.url.includes('.jpg') ||
         request.url.includes('.jpeg') ||
         request.url.includes('.svg') ||
         request.url.includes('.webp') ||
         request.url.includes('.woff') ||
         request.url.includes('.woff2');
}

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  console.log('Service Worker: Processing background sync');
}

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('./')
  );
});
