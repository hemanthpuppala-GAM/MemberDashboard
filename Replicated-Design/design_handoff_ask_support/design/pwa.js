/* Installable app: service worker, standalone-mode polish, and a quiet
   "add to home screen" invitation. Loaded on every page. */
(function () {
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }

  var standalone = window.matchMedia('(display-mode: standalone)').matches ||
                   window.matchMedia('(display-mode: fullscreen)').matches ||
                   window.navigator.standalone === true ||
                   /[?&]appview=1/.test(location.search); // test hook: append ?appview=1

  /* ---- Launched from the home screen: make it behave like an app ---------
     The status bar is translucent on iOS, so without safe-area padding the
     nav slides under the clock. Rubber-band scroll, tap highlights, the
     long-press callout and stray text selection all read as "web page". */
  if (standalone) {
    document.documentElement.setAttribute('data-standalone', '');
    var css = document.createElement('style');
    css.textContent = [
      'html[data-standalone] body { overscroll-behavior: none; }',
      'html[data-standalone] { -webkit-tap-highlight-color: transparent; }',
      /* clear the notch / status bar — pad the inner scroll containers only.
         .r-shell is a 100vh border-box with 100vh children, so padding it
         would push the children's bottoms off-screen behind overflow:hidden. */
      'html[data-standalone] .m-nav { margin-top: calc(16px + env(safe-area-inset-top)) !important; }',
      'html[data-standalone] .r-sidebar { padding-top: calc(18px + env(safe-area-inset-top)) !important; }',
      'html[data-standalone] .r-main { padding-top: env(safe-area-inset-top) !important; }',
      /* chrome is furniture, not text: no callout, no accidental selection */
      'html[data-standalone] button, html[data-standalone] a, html[data-standalone] nav, html[data-standalone] [role="button"] {',
      '  -webkit-touch-callout: none; -webkit-user-select: none; user-select: none; }',
      /* prose and anything typed into stays selectable */
      'html[data-standalone] p, html[data-standalone] input, html[data-standalone] textarea,',
      'html[data-standalone] [contenteditable] { -webkit-user-select: text; user-select: text; }',
      /* a touch of press feedback in place of a native ripple */
      'html[data-standalone] button:active, html[data-standalone] [role="button"]:active {',
      '  transform: scale(0.975); transition: transform .08s ease; }',
    ].join('\n');
    (document.head || document.documentElement).appendChild(css);

    /* Off-site links leave for the system browser rather than stranding the
       member in a chrome-less window with no way back. */
    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest && e.target.closest('a[href]');
      if (!a || a.target === '_blank') return;
      var url;
      try { url = new URL(a.href, location.href); } catch (err) { return; }
      if (url.protocol.startsWith('http') && url.host !== location.host) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
    }, true);
  }

  var KEY = 'gaw_install_dismissed';
  var dismissed = false;
  try { dismissed = localStorage.getItem(KEY) === '1'; } catch (e) {}
  if (standalone || dismissed) return;

  function bar(html, onInstall) {
    var el = document.createElement('div');
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Install Golden Age Wisdom');
    el.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);top:78px;z-index:9999;' +
      'display:flex;align-items:center;gap:12px;padding:10px 12px 10px 14px;border-radius:999px;' +
      'background:rgba(23,17,48,0.94);border:1px solid rgba(213,183,124,0.35);' +
      'box-shadow:0 12px 40px rgba(0,0,0,0.5);backdrop-filter:blur(12px);' +
      "font-family:'Outfit',sans-serif;color:#e6d3a8;font-size:13px;max-width:calc(100% - 24px);" +
      'opacity:0;transition:opacity .5s ease';
    el.innerHTML = html;
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.style.opacity = '1'; });
    var act = el.querySelector('[data-act]');
    if (act && onInstall) act.addEventListener('click', function () { onInstall(el); });
    el.querySelector('[data-no]').addEventListener('click', function () {
      try { localStorage.setItem(KEY, '1'); } catch (e) {}
      el.style.opacity = '0';
      setTimeout(function () { el.remove(); }, 500);
    });
    return el;
  }

  var closeBtn = '<button data-no aria-label="Not now" style="width:26px;height:26px;flex-shrink:0;border-radius:50%;border:none;background:rgba(255,255,255,0.06);color:#9a927f;font-size:14px;cursor:pointer">×</button>';

  // Android / desktop Chrome
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    var deferred = e;
    setTimeout(function () {
      bar('<span style="min-width:0">Keep Golden Age Wisdom on your home screen</span>' +
          '<button data-act style="padding:7px 16px;border-radius:999px;border:none;background:linear-gradient(135deg,#d5b77c,#b89758);color:#241b06;font-family:inherit;font-weight:600;font-size:12.5px;cursor:pointer;white-space:nowrap">Install</button>' +
          closeBtn,
        function (el) {
          deferred.prompt();
          deferred.userChoice.finally(function () {
            try { localStorage.setItem(KEY, '1'); } catch (e) {}
            el.remove();
          });
        });
    }, 8000);
  });

  // iOS Safari has no prompt API — show the two-step gesture instead
  var iOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  var safari = /safari/i.test(navigator.userAgent) && !/crios|fxios|edgios/i.test(navigator.userAgent);
  if (iOS && safari) {
    setTimeout(function () {
      bar('<span style="min-width:0;font-weight:300">Add to Home Screen: tap <span style="color:#f2e9d8">Share</span> then <span style="color:#f2e9d8">Add to Home Screen</span></span>' + closeBtn);
    }, 9000);
  }
})();
