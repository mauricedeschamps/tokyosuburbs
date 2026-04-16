const CACHE_NAME = 'nature-tokyo-v1';
const urlsToCache = [
  '/',
  'index.html',
  'manifest.json',
  // アイコンファイルは任意キャッシュ (オプション)
  'icons/icon-192.jpg',
  'icons/icon-512.jpg'
];

// インストール時にキャッシュ
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// フェッチ時にキャッシュ優先、なければネットワーク
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          networkResponse => {
            // 画像などはキャッシュに追加しない（必要に応じて変更可）
            if (!event.request.url.includes('picsum.photos') && !event.request.url.includes('source.unsplash')) {
              return caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
              });
            }
            return networkResponse;
          }
        );
      })
      .catch(() => {
        // オフライン時に代替ページ（必要なら）
        return caches.match('index.html');
      })
  );
});

// 古いキャッシュの削除
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});