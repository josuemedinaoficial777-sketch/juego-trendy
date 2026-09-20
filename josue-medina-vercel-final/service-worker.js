const CACHE = 'josue-medina-catalogo-v1';
const ASSETS = ['./', './index.html', './styles.css', './app.js', './manifest.json', './icon-jm.svg', './bio-premio-1.jpeg', './bio-premio-2.jpeg'];
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS))));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => { if (event.request.method !== 'GET') return; event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); return response; }).catch(() => caches.match('./index.html'))); });
