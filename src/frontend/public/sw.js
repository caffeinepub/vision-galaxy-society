const CACHE_NAME = 'vision-galaxy-v4';

// Build cache URLs relative to service worker scope
function getCacheUrls() {
  try {
    const scope = self.registration ? self.registration.scope : self.location.origin + '/';
    return [
      new URL('./', scope).href,
      new URL('./index.html', scope).href,
      new URL('./assets/generated/vision-galaxy-logo.dim_512x512.png', scope).href,
      new URL('./assets/generated/vision-galaxy-bg.dim_1920x1080.png', scope).href
    ];
  } catch (e) {
    // Fallback to relative paths if URL construction fails
    return [
      './',
      './index.html',
      './assets/generated/vision-galaxy-logo.dim_512x512.png',
      './assets/generated/vision-galaxy-bg.dim_1920x1080.png'
    ];
  }
}

self.addEventListener('install', (event) => {
  // Best-effort caching - don't block installation
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        const urls = getCacheUrls();
        return Promise.allSettled(
          urls.map(url => cache.add(url).catch(() => {
            // Ignore individual cache failures
          }))
        );
      })
      .catch(() => {
        // Fail silently if caching fails completely
      })
  );
  
  // Activate immediately
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Determine request type based on URL and headers
  const isNavigationRequest = 
    request.mode === 'navigate' || 
    request.destination === 'document' ||
    (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'));
  
  const isScriptOrStyle = 
    url.pathname.endsWith('.js') || 
    url.pathname.endsWith('.mjs') ||
    url.pathname.endsWith('.css') ||
    url.pathname.includes('/src/') ||
    request.destination === 'script' ||
    request.destination === 'style';
  
  const isAsset = 
    url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot|ico)$/i) ||
    request.destination === 'image' ||
    request.destination === 'font';

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // For scripts, styles, and assets: never return cached index.html
        if ((isScriptOrStyle || isAsset) && cachedResponse) {
          const contentType = cachedResponse.headers.get('content-type') || '';
          // Only return cached response if content type matches request type
          if (isScriptOrStyle && !contentType.includes('text/html')) {
            return cachedResponse;
          }
          if (isAsset && !contentType.includes('text/html')) {
            return cachedResponse;
          }
          // If cached response is HTML but request is for script/asset, ignore cache
        } else if (cachedResponse && isNavigationRequest) {
          // For navigation requests, cached response is OK
          return cachedResponse;
        }
        
        // Attempt network fetch
        return fetch(request).catch((error) => {
          // Network failed - only fall back to index.html for navigation requests
          if (isNavigationRequest) {
            // For navigation requests, try to serve cached index.html
            return caches.match('./index.html')
              .then(indexResponse => {
                if (indexResponse) {
                  return indexResponse;
                }
                // If no cached index.html, throw the original error
                throw error;
              });
          }
          
          // For non-navigation requests (JS, CSS, images, etc.), don't fall back to index.html
          // Just throw the error so the browser handles it appropriately
          throw error;
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.allSettled(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .catch(() => {
        // Fail silently
      })
  );
  
  // Take control immediately
  return self.clients.claim();
});
