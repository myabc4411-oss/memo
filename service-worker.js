const CACHE_NAME = 'memo-v1';

// 캐시할 파일 목록 (경로는 실제 GitHub Pages 구조에 맞게 자동 처리)
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  // CodeMirror CDN은 fetch 이벤트에서 동적으로 캐시됨
];

// ── 설치: 핵심 파일 캐시 ──────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ── 활성화: 이전 캐시 정리 ────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: 캐시 우선, 실패 시 네트워크 ───────────────────────
self.addEventListener('fetch', event => {
  // Google Drive API / OAuth 요청은 캐시하지 않음
  const url = event.request.url;
  if (
    url.includes('googleapis.com') ||
    url.includes('accounts.google.com') ||
    url.includes('gsi/client') ||
    event.request.method !== 'GET'
  ) {
    return; // 기본 fetch 동작 유지
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        // 유효한 응답만 캐시 (CDN 파일 포함)
        if (
          response &&
          response.status === 200 &&
          (response.type === 'basic' || response.type === 'cors')
        ) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      }).catch(() => {
        // 네트워크도 실패하면 오프라인 안내 (index.html 반환)
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
