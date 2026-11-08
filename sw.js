/* O Seu Prato: service worker. Guarda só o "casco" da app (páginas e ficheiros próprios). Nunca guarda pedidos à API. */
const V = 'osp-v1';
self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== self.location.origin) return; // API e fontes: sempre diretos
  e.respondWith(
    fetch(r).then((res) => { if (res.ok) { const c = res.clone(); caches.open(V).then((ch) => ch.put(r, c)); } return res; })
      .catch(() => caches.match(r).then((m) => m || caches.match('./') || new Response('Sem ligação. Tente outra vez quando tiver internet.', { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } })))
  );
});
