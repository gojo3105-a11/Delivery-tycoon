const CACHE = 'hdt-v5';
const ASSETS = [
  './index.html',
  './manifest.json',
  './icon.svg',
  './assets/index-DQb30I05.css',
  './assets/index-DZRYlIWe.js',
  './assets/react-BRnhmgIC.js',
  './assets/phaser-Czz4FBZH.js',
  './assets/web-BtMGll2_.js',
  './assets/web-C7X9W99q.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => cached))
  );
});
