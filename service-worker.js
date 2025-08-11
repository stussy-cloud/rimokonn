// PWA用キャッシュ（更新時は名前を +1）
const CACHE = 'hint-town-v37';
const ASSETS = ['./','./index.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k!==CACHE?caches.delete(k):null))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(event.request, copy)).catch(()=>{});
      return resp;
    }).catch(()=>caches.match(event.request))
  );
});
