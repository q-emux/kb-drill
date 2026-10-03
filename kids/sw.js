const CACHE = 'kbkids-20261003-1943.2cafe32';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  // Pulisce SOLO le cache di questa app (prefisso kbkids-). Le cache del drill nella radice non si toccano.
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k.startsWith('kbkids-') && k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  const isDoc = e.request.mode === 'navigate' ||
                (e.request.destination === '' && e.request.url.indexOf('.html') >= 0);
  const req = isDoc ? new Request(e.request.url, {cache: 'reload'}) : e.request;
  e.respondWith(
    fetch(req).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return r;
    }).catch(() => caches.open(CACHE).then(c => c.match(e.request).then(m => m || c.match('./index.html'))))
  );
});
