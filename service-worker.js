/* service-worker.js — ヒントの町 / 安全・自動版
   - CACHE名は version.js の self.__BUILD を使用（なければ 'dev'）
   - HTMLは network-first、JS/CSS/画像は stale-while-revalidate
   - v / nocache / killsw / renderer のクエリはキャッシュキーから除外
   - 旧キャッシュは activate で自動削除
*/

'use strict';

/* 自動バージョン（Actionsで version.js を書き換え） */
try { importScripts('./version.js'); } catch (e) { /* version.js なしでもOK */ }
const BUILD = (typeof self !== 'undefined' && self.__BUILD) ? self.__BUILD : 'dev';
const CACHE = `hint-town-${BUILD}`;
const CACHE_PREFIX = 'hint-town-';

/* 変えやすい：コア資産（初回インストールでキャッシュ） */
const CORE_ASSETS = [
  './',
  './index.html',
  './config.js',
  './city_safe.js',
  './city_pop.js',
  './entities.js',
  './main.js',
  './polyfills.js',
  './manifest.webmanifest'
];

/* キャッシュキー正規化：?v, ?nocache, ?killsw, ?renderer を除外 */
function normalizedUrl(req) {
  try {
    const u = new URL(req.url);
    // GitHub Pages の自ドメイン以外は正規化しない（CORSのopaqueレスポンス対策）
    const sameOrigin = u.origin === self.location.origin;
    if (!sameOrigin) return req.url;

    const params = u.searchParams;
    params.delete('v');
    params.delete('nocache');
    params.delete('killsw');
    params.delete('renderer');
    // クエリが空なら ? を消す
    u.search = params.toString();
    return u.toString();
  } catch {
    return req.url;
  }
}

/* Install: コアを先読み・即skipWaiting */
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll(CORE_ASSETS.map((u) => new Request(u, { cache: 'reload' })));
      // 早めに新SWを有効化
      self.skipWaiting();
    })()
  );
});

/* Activate: 古いキャッシュを掃除・clients を即制御 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE)
          .map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

/* Fetch戦略
   - HTML (navigate, text/html): network-first（オフラインはキャッシュHTML）
   - その他（JS/CSS/画像等）       : stale-while-revalidate
*/
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return; // POST等は素通し

  const accept = req.headers.get('Accept') || '';
  const isHTML =
    req.mode === 'navigate' ||
    accept.includes('text/html');

  if (isHTML) {
    // HTMLはネット優先
    event.respondWith(networkFirst(req));
  } else {
    // 資産はSWR
    event.respondWith(staleWhileRevalidate(req));
  }
});

/* HTML: Network First */
async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(req);
    // 同一オリジンのときだけ正規化キーに保存
    const key = normalizedUrl(req);
    if (new URL(req.url).origin === self.location.origin) {
      cache.put(key, res.clone());
    }
    return res;
  } catch {
    // オフライン：キャッシュから
    const key = normalizedUrl(req);
    const cached = await cache.match(key) || await cache.match('./index.html');
    return cached || new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

/* Assets: Stale-While-Revalidate */
async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE);
  const key = normalizedUrl(req);

  const cached = await cache.match(key);
  const fetchPromise = fetch(req)
    .then((res) => {
      // 同一オリジンなら正規化キーで更新
      if (new URL(req.url).origin === self.location.origin) {
        cache.put(key, res.clone());
      }
      return res;
    })
    .catch(() => null);

  return cached || fetchPromise || new Response(null, { status: 504, statusText: 'Gateway Timeout' });
}

/* 任意: ページからメッセージで制御 */
self.addEventListener('message', (event) => {
  const { type } = event.data || {};
  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (type === 'CLEAR_OLD_CACHES') {
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE)
          .map((name) => caches.delete(name))
      );
    })();
  }
});
