const CACHE = 'hdt-v6';
const ASSETS = [
  './index.html', './manifest.json', './icon.svg',
  './assets/index-D5DBTJSJ.css',
  './assets/index-CK1K9hGZ.js',
  './assets/react-BRnhmgIC.js',
  './assets/phaser-Czz4FBZH.js',
  './assets/web-CVy9EZ0U.js',
  './assets/web-kU10b1_T.js',
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
