// service-worker.js 置き換え版
const CACHE = 'hint-town-v10'; // ←番号を上げる
const ASSETS = [
  './index.html',              // オフライン用に保持
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', e => {
  self.skipWaiting(); // 新SWを即待機解除
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim()) // すぐページを引き継ぐ
  );
});

// 重要: ページ遷移(HTML)はネット優先 → 失敗したらキャッシュ
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(() => caches.match('./index.html'))
    );
    return;
  }
  // それ以外は従来どおり: キャッシュ優先
  e.respondWith(caches.match(req).then(r => r || fetch(req)));
});
