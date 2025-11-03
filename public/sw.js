// Simple Service Worker for caching static assets
const CACHE_NAME = 'echonote-intro-v1.2.0'
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/images/hero/hero-mockup.svg',
  '/images/features/feature-privacy.svg',
  '/images/features/feature-local-processing.svg',
  '/images/features/feature-smart-calendar.svg',
  '/images/features/feature-cross-platform.svg',
  '/images/features/feature-transcription.svg',
]

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(STATIC_CACHE_URLS)
      })
      .then(() => {
        return self.skipWaiting()
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        return self.clients.claim()
      })
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  event.respondWith(
    caches
      .match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return (
          response ||
          fetch(event.request).then(fetchResponse => {
            // Cache successful responses
            if (fetchResponse.status === 200) {
              const responseClone = fetchResponse.clone()
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone)
              })
            }
            return fetchResponse
          })
        )
      })
      .catch(() => {
        // Fallback for offline scenarios
        if (event.request.destination === 'document') {
          return caches.match('/index.html')
        }
      })
  )
})
