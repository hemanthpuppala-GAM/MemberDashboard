/* Golden Age Wisdom v2 — offline shell. Network-first for pages & content JSON, cache-first for assets. */
const V = 'gaw-v2-1';
const PAGES = ['Home Bodhi Tree v2.dc.html','About.dc.html','Mission.dc.html','Meditation.dc.html','Wisdom.dc.html','Wellness.dc.html','Events.dc.html','offline-v2.html'];
const SHELL = ['support.js','pwa-v2.js','manifest-v2.webmanifest','assets/logo-original.jpg','assets/pwa/icon-192.png','assets/pwa/icon-512.png',
  'content/home.json','content/about.json','content/mission.json','content/meditation.json','content/wisdom.json','content/wellness.json','content/events.json'];
const base = new URL('./', self.location).href;
const abs = (p) => new URL(p, base).href;
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(V).then(c => Promise.all([...PAGES, ...SHELL].map(u => c.add(new Request(abs(u), { cache: 'reload' })).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url); if (url.origin !== location.origin) return;
  const isPage = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
  const isContent = url.pathname.includes('/content/') || url.pathname.endsWith('.webmanifest');
  if (isPage || isContent) {
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(V).then(c => c.put(req, copy)); return r; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || (isPage ? caches.match(abs('offline-v2.html')) : undefined))));
    return;
  }
  if (url.pathname.endsWith('.mp4')) return;
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok && r.type === 'basic') { const copy = r.clone(); caches.open(V).then(c => c.put(req, copy)); } return r; })));
});