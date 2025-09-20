// Service Worker for Offline Functionality

const CACHE_NAME = 'safishield-cache-v1';
// This list should contain the essential "shell" of the app.
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg'
  // Main JS/CSS and other critical assets will be cached on first fetch.
];

// On install, precache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        // Setting { cache: 'reload' } prevents using the browser's HTTP cache.
        const requests = PRECACHE_URLS.map(url => new Request(url, { cache: 'reload' }));
        return cache.addAll(requests);
      })
      .then(() => self.skipWaiting())
      .catch(err => {
        console.error('Service Worker: Pre-caching failed:', err);
      })
  );
});

// On activate, clean up old caches
self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// On fetch, use an appropriate caching strategy
self.addEventListener('fetch', event => {
  // We only want to handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  const url = new URL(event.request.url);

  // For HTML pages, use a network-first strategy to get updates faster.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
           // If the fetch is successful, cache the new version.
           const responseToCache = response.clone();
           caches.open(CACHE_NAME).then(cache => {
               cache.put(event.request, responseToCache);
           });
           return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // For all other assets (JS, CSS, fonts, models), use a cache-first strategy.
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        // Not in cache, fetch from network and cache the response.
        return fetch(event.request).then(
          networkResponse => {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return networkResponse;
          }
        ).catch(error => {
          console.error('Service Worker: Fetch failed for', event.request.url, error);
          throw error;
        });
      })
  );
});
