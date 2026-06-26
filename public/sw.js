const CACHE = 'hdt-v11';
const ASSETS = [
  './index.html', './manifest.json', './icon.svg',
  './assets/index-C-f2GKqv.css',
  './assets/index-E1y-VZ9O.js',
  './assets/react-BRnhmgIC.js',
  './assets/phaser-Czz4FBZH.js',
  './assets/web-B5ffuriH.js',
  './assets/web-BlTAK8aH.js',
  './sprites/worker.svg',
  './sprites/tree.svg',
  './sprites/bus.svg',
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
