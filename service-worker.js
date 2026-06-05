const CACHE_NAME = 'memo-v5';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 항상 네트워크 우선
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('googleapis.com') ||
      event.request.url.includes('accounts.google.com') ||
      event.request.url.includes('gstatic.com') ||
      event.request.url.includes('firebaseapp.com')) return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
