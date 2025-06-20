
// Enhanced PWA Service Worker for NyxChat APK v6
const CACHE_NAME = "nyxchat-apk-v6";
const STATIC_CACHE = "nyxchat-static-v6";
const DYNAMIC_CACHE = "nyxchat-dynamic-v6";
const IMAGE_CACHE = "nyxchat-images-v6";

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// Install event - cache core assets
self.addEventListener("install", event => {
  console.log("Service Worker: Installing APK v6...");
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log("Service Worker: Caching core assets");
      return Promise.allSettled(
        CORE_ASSETS.map(asset => 
          cache.add(asset).catch(err => console.warn(`Failed to cache ${asset}:`, err))
        )
      );
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener("activate", event => {
  console.log("Service Worker: Activating APK v6...");
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheName.includes("v6")) {
            console.log("Service Worker: Clearing old cache", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Enhanced fetch event for APK context
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  
  const url = new URL(event.request.url);
  
  // Handle capacitor:// and file:// protocols for APK
  if (url.protocol === 'capacitor:' || url.protocol === 'file:') {
    return;
  }
  
  // Skip external requests in APK mode
  if (url.origin !== self.location.origin && !isEssentialResource(event.request)) {
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
    if (isEssentialResource(request)) {
      return await cacheFirst(request, IMAGE_CACHE);
    }
    
    // Network first for API calls with better offline fallback
    return await networkFirst(request);
    
  } catch (error) {
    console.warn("Service Worker: Fetch failed", error);
    return await handleOfflineFallback(request);
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    // Refresh cache in background for APK context
    fetch(request).then(response => {
      if (response && response.status === 200) {
        cache.put(request, response.clone());
      }
    }).catch(() => {});
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
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
    return cache.match('./') || new Response('App is offline', { 
      status: 503, 
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' }
    });
  }
  
  return new Response('Resource unavailable offline', { 
    status: 503, 
    statusText: 'Service Unavailable' 
  });
}

function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.includes('.js') || 
         url.pathname.includes('.css') || 
         url.pathname === './' ||
         url.pathname === './index.html' ||
         url.pathname === './manifest.json';
}

function isEssentialResource(request) {
  return request.destination === 'image' || 
         request.destination === 'font' ||
         request.url.includes('.png') ||
         request.url.includes('.jpg') ||
         request.url.includes('.jpeg') ||
         request.url.includes('.svg') ||
         request.url.includes('.webp') ||
         request.url.includes('.woff') ||
         request.url.includes('.woff2') ||
         request.url.includes('.ico');
}

// APK-specific event handlers
self.addEventListener('beforeinstallprompt', event => {
  console.log('Service Worker: beforeinstallprompt event (APK mode)');
});

self.addEventListener('appinstalled', event => {
  console.log('Service Worker: App successfully installed as APK');
});

// Enhanced background sync for APK
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  console.log('Service Worker: Processing background sync (APK mode)');
}

// Handle notification clicks in APK
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('./').catch(err => 
      console.error('Failed to open window in APK:', err)
    )
  );
});

// APK-specific message handling
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
