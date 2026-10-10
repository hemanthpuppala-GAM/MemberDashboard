/* Golden Age Wisdom v2 — PWA bootstrap: meta tags, manifest, service worker, standalone flag. */
(function () {
  const h = document.head, add = (tag, attrs) => { const el = document.createElement(tag); Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v)); h.appendChild(el); return el; };
  if (!h.querySelector('link[rel="manifest"]')) add('link', { rel: 'manifest', href: 'manifest-v2.webmanifest' });
  if (!h.querySelector('meta[name="theme-color"]')) add('meta', { name: 'theme-color', content: '#14241C' });
  add('meta', { name: 'mobile-web-app-capable', content: 'yes' });
  add('meta', { name: 'apple-mobile-web-app-capable', content: 'yes' });
  add('meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' });
  add('meta', { name: 'apple-mobile-web-app-title', content: 'Golden Age' });
  add('link', { rel: 'apple-touch-icon', href: 'assets/pwa/apple-touch-icon.png' });
  const vp = h.querySelector('meta[name="viewport"]'); if (vp) vp.setAttribute('content', 'width=device-width, initial-scale=1, viewport-fit=cover');
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw-v2.js', { scope: './' }).catch(() => {}));
  }
  if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true) document.documentElement.setAttribute('data-pwa', '1');
})();