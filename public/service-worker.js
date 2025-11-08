const CACHE_NAME = 'kia-cache-v4';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Forzar la activación del nuevo SW
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Fallo al cachear durante la instalación:', error);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Borrando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Tomar control inmediato
  );
});

self.addEventListener('fetch', event => {
  // Estrategia: Primero la red, luego el caché para la navegación principal.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Si la respuesta es válida, la cacheamos y la devolvemos
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          // Si la red falla, intentamos obtenerla del caché
          return caches.match(event.request);
        })
    );
    return;
  }

  // Estrategia: Primero el caché, luego la red para otros assets.
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Don't cache API calls to Netlify functions
        if (event.request.url.includes('/.netlify/functions/')) {
            return fetch(event.request);
        }

        return fetch(event.request).then(
          fetchResponse => {
            if (!fetchResponse || fetchResponse.status !== 200 || event.request.method !== 'GET') {
              return fetchResponse;
            }

            const responseToCache = fetchResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Solo cacheamos assets básicos (misma origen) y de CDNs confiables
                if (fetchResponse.type === 'basic' || event.request.url.startsWith('https://aistudiocdn.com')) {
                    cache.put(event.request, responseToCache);
                }
              });

            return fetchResponse;
          }
        );
      })
    );
});