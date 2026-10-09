/* Golden Age Wisdom v2 — offline shell for the React app (from design sw-v2.js).
   Scope = the app's base folder. Pages: network-first, cached copy or offline page when offline.
   Built assets (hashed) and site/assets: cache-first. Everything else (API, media) passes through. */
const V = 'gaw-v2-1';
const base = new URL('./', self.location).href;
const scopePath = new URL(base).pathname;
const abs = (p) => new URL(p, base).href;
const SHELL = ['./', 'offline-v2.html', 'manifest-v2.webmanifest', 'site/assets/logo-original.jpg', 'site/assets/pwa/icon-192.png', 'site/assets/pwa/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(V)
      .then((c) => Promise.all(SHELL.map((u) => c.add(new Request(abs(u), { cache: 'reload' })).catch(() => {}))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k.startsWith('gaw-v2') && k !== V).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin || !url.pathname.startsWith(scopePath)) return; // API lives outside the app folder

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((r) => {
          const copy = r.clone();
          caches.open(V).then((c) => c.put(abs('./'), copy)); // SPA: every route is index.html
          return r;
        })
        .catch(() => caches.match(abs('./')).then((r) => r || caches.match(abs('offline-v2.html')))),
    );
    return;
  }

  const rel = url.pathname.slice(scopePath.length);
  if (/\.(mp4|pdf)$/i.test(rel)) return;
  if (!rel.startsWith('assets/') && !rel.startsWith('site/assets/')) return;

  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((r) => {
      if (r.ok && r.type === 'basic') {
        const copy = r.clone();
        caches.open(V).then((c) => c.put(req, copy));
      }
      return r;
    })),
  );
});
