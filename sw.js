// 常に最新を取得、オフライン時のみキャッシュを使用
var CACHE_NAME = 'tennis-doubles-v1';
var urlsToCache = [
  '/tennis-doubles/',
  '/tennis-doubles/index.html',
  '/tennis-doubles/manifest.json'
];

self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    fetch(e.request, { cache: 'no-store' })
      .then(function(response) {
        // 取得成功したらキャッシュも更新
        var resClone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(e.request, resClone);
        });
        return response;
      })
      .catch(function() {
        // オフラインの時だけキャッシュを使用
        return caches.match(e.request);
      })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});
