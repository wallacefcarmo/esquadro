const CACHE = 'esquadro-v1';
const STATIC = ['/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Páginas são autenticadas e dinâmicas — nunca cacheia HTML/dados, só assets estáticos.
self.addEventListener('fetch', e => {
  const req = e.request;
  const url = req.url;

  if (req.method !== 'GET') return;
  if (url.includes('supabase.co')) return;
  if (req.mode === 'navigate') return;
  if (!url.includes('/_next/static') && !STATIC.some(s => url.endsWith(s))) return;

  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(req, clone));
      return res;
    }))
  );
});
