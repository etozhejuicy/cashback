const CACHE_NAME = 'cashback-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/src/app.js',
  '/assets/banks/tinkoff.svg',
  '/assets/banks/sber.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
});