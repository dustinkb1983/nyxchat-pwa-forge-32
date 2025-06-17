
// Enhanced PWA Service Worker for NyxChat v3
const CACHE_NAME = "nyxchat-pwa-v3";
const STATIC_CACHE = "nyxchat-static-v3";
const DYNAMIC_CACHE = "nyxchat-dynamic-v3";
const IMAGE_CACHE = "nyxchat-images-v3";

const CORE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/lovable-uploads/2fe14165-cccc-44c9-a268-7ab4c910b4d8.png",
  "/lovable-uploads/f1345f48-4cf9-47e5-960c-3b6d62925c7f.png",
  "/lovable-uploads/ef071ded-72e2-42cb-a46b-47bf922f911f.png",
  "/lovable-uploads/de22cf8d-553d-4c51-a283-91a089a844be.png"
];

const CACHE_CONFIG = {
  static: {
    maxEntries: 50,
    maxAgeSeconds: 86400 * 30 // 30 days
  },
  dynamic: {
    maxEntries: 100,
    maxAgeSeconds: 86400 * 7 // 7 days
  },
  images: {
    maxEntries: 50,
    maxAgeSeconds: 86400 * 30 // 30 days
  }
};

// Install event - cache core assets
self.addEventListener("install", event => {
  console.log("Service Worker: Installing v3...");
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log("Service Worker: Caching core assets");
      return cache.addAll(CORE_ASSETS).catch(err => {
        console.warn("Service Worker: Failed to cache some assets", err);
        // Cache what we can
        return Promise.allSettled(
          CORE_ASSETS.map(asset => cache.add(asset))
        );
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener("activate", event => {
  console.log("Service Worker: Activating v3...");
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheName.includes("v3")) {
            console.log("Service Worker: Clearing old cache", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Enhanced fetch event with smart caching strategies
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  
  const url = new URL(event.request.url);
  
  // Skip cross-origin requests that aren't images
  if (url.origin !== self.location.origin && !isImageRequest(event.request)) {
    return;
  }

  event.respondWith(handleFetch(event.request));
});

async function handleFetch(request) {
  const url = new URL(request.url);
  
  try {
    // Strategy 1: Cache first for static assets
    if (isStaticAsset(request)) {
      return await cacheFirst(request, STATIC_CACHE);
    }
    
    // Strategy 2: Cache first for images
    if (isImageRequest(request)) {
      return await cacheFirst(request, IMAGE_CACHE);
    }
    
    // Strategy 3: Network first for API calls and dynamic content
    if (isApiRequest(request) || isDynamicContent(request)) {
      return await networkFirst(request, DYNAMIC_CACHE);
    }
    
    // Strategy 4: Stale while revalidate for everything else
    return await staleWhileRevalidate(request, DYNAMIC_CACHE);
    
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
  
  const response = await fetch(request);
  if (response.status === 200) {
    await cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then(response => {
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);
  
  return cached || await fetchPromise;
}

async function handleOfflineFallback(request) {
  if (request.destination === 'document') {
    const cache = await caches.open(STATIC_CACHE);
    return cache.match('/') || new Response('Offline', { status: 503 });
  }
  
  if (isImageRequest(request)) {
    // Return a placeholder image or cached version
    const cache = await caches.open(IMAGE_CACHE);
    return cache.match(request) || new Response('', { status: 503 });
  }
  
  return new Response('Offline', { status: 503 });
}

// Helper functions
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.includes('.js') || 
         url.pathname.includes('.css') || 
         url.pathname === '/' ||
         url.pathname === '/index.html' ||
         url.pathname === '/manifest.json';
}

function isImageRequest(request) {
  return request.destination === 'image' || 
         request.url.includes('.png') ||
         request.url.includes('.jpg') ||
         request.url.includes('.jpeg') ||
         request.url.includes('.svg') ||
         request.url.includes('.webp');
}

function isApiRequest(request) {
  return request.url.includes('/api/') || 
         request.url.includes('supabase.co');
}

function isDynamicContent(request) {
  const url = new URL(request.url);
  return url.pathname.includes('/memory') ||
         url.pathname.includes('/profiles') ||
         url.pathname.includes('/settings');
}

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  // Handle offline message queue here
  console.log('Service Worker: Processing background sync');
}

// Push notifications support (future enhancement)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icon-192.png',
        badge: '/icon-72.png'
      })
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
