const CACHE_NAME = 'mazique-v4-cache';
const assets = [
  './',
  './index.html',
  './css/style.css',
  './js/main.js',
  './js/pet.js',
  './js/arcade.js',
  './js/audio.js',
  './js/particles.js',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(assets))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});