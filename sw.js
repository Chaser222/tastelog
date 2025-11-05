const CACHE_NAME = 'tastelog-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/food icon.png',
  './icons/food icon xl.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(ASSETS);
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(e.request, { ignoreSearch: true });
    if (cached) return cached;
    try {
      const res = await fetch(e.request);
      if (res && res.ok && new URL(e.request.url).origin === location.origin) {
        cache.put(e.request, res.clone());
      }
      return res;
    } catch {
      return cached || Response.error();
    }
  })());
});
