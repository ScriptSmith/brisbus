const CACHE_NAME = 'brisbus-v1';
const urlsToCache = [
  '/brisbus/',
  '/brisbus/index.html',
  '/brisbus/manifest.json',
  '/brisbus/icon-192.png',
  '/brisbus/icon-512.png',
  'https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.css',
  'https://unpkg.com/maplibre-gl@2.4.0/dist/maplibre-gl.js',
  'https://unpkg.com/protobufjs@7.2.3/dist/protobuf.min.js',
  'https://unpkg.com/jszip@3.10.1/dist/jszip.min.js'
];

// Install event - cache static resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache.map(url => new Request(url, { cache: 'no-cache' })))
          .catch(err => {
            console.warn('Failed to cache some resources:', err);
            // Continue even if some resources fail to cache
            return Promise.resolve();
          });
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache when offline, network first for API calls
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Network-first strategy for API calls (real-time data)
  if (url.hostname.includes('api.') || url.pathname.includes('VehiclePositions') || url.pathname.includes('SEQ_GTFS.zip')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // Cache-first strategy for static assets
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(response => {
          // Cache the fetched resource for future use
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        });
      })
  );
});
