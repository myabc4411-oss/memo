const CACHE_NAME = 'memo-v3';

// 설치 시 이전 캐시 전부 삭제
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

// 항상 네트워크에서 최신 파일 받기 (캐시 사용 안 함)
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('googleapis.com') ||
      event.request.url.includes('accounts.google.com')) return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
