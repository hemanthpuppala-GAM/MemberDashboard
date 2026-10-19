/* Retires the previous site's service worker (it registered /sw.js with caches named "gaw-vNN").
   After go-live, returning visitors' browsers fetch this file as an update of that old worker:
   it deletes the old caches, unregisters itself and reloads open tabs, so they get the new site.
   The new site's own worker is sw-v2.js (caches "gaw-v2-…"), which this leaves alone. */
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => /^gaw-v\d+$/.test(k)).map((k) => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then((tabs) => tabs.forEach((t) => t.navigate(t.url))),
  );
});
