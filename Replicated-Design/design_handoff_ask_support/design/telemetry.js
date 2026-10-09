/* Golden Age Wisdom — first-party, cookie-less telemetry.
   Nothing leaves the device: events live in localStorage until the Laravel
   backend accepts them. No third-party scripts, no advertising identifiers.
   Recording is skipped entirely until the visitor accepts analytics. */
(function () {
  const EVT = 'gaw_telemetry', VID = 'gaw_vid', CONSENT = 'gaw_consent';
  const CAP = 4000;

  const read = (k, fb) => { try { return JSON.parse(localStorage.getItem(k) || 'null') ?? fb; } catch (e) { return fb; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const dayKey = (ts) => { const d = new Date(ts), p = n => String(n).padStart(2, '0'); return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); };

  function consent() { const c = read(CONSENT, null); return c && c.analytics === true; }

  function visitorId() {
    let v = null;
    try { v = localStorage.getItem(VID); } catch (e) {}
    if (!v) {
      v = 'v-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
      try { localStorage.setItem(VID, v); } catch (e) {}
    }
    return v;
  }

  function device() {
    const w = window.innerWidth;
    if (w < 700) return 'phone';
    if (w < 1100) return 'tablet';
    return 'desktop';
  }

  function prune(list) {
    const days = (window.GAW_CONFIG && window.GAW_CONFIG.telemetryRetentionDays) || 90;
    const cutoff = Date.now() - days * 86400000;
    const kept = list.filter(e => e.t >= cutoff);
    return kept.length > CAP ? kept.slice(kept.length - CAP) : kept;
  }

  const GAW = {
    consentGiven: consent,
    setConsent(analytics) {
      write(CONSENT, { analytics: !!analytics, at: Date.now(), version: 1 });
      if (!analytics) { try { localStorage.removeItem(EVT); localStorage.removeItem(VID); } catch (e) {} }
    },
    consentRecord() { return read(CONSENT, null); },

    track(page, extra) {
      if (!consent()) return;
      const list = prune(read(EVT, []));
      const session = read('gaw_session', null);
      list.push(Object.assign({
        t: Date.now(), d: dayKey(Date.now()), p: page || (location.pathname.split('/').pop() || 'index'),
        v: visitorId(), dev: device(),
        m: session && session.memberId ? session.memberId : null,
        tz: (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { return ''; } })(),
      }, extra || {}));
      write(EVT, list);
    },

    events() { return prune(read(EVT, [])); },

    /* ---- aggregates the admin panel reads ---- */
    daily(days) {
      const n = days || 14, out = [];
      for (let i = n - 1; i >= 0; i--) {
        const key = dayKey(Date.now() - i * 86400000);
        out.push({ day: key, views: 0, visitors: new Set(), members: new Set() });
      }
      const idx = {}; out.forEach((r, i) => { idx[r.day] = i; });
      this.events().forEach(e => {
        const i = idx[e.d];
        if (i == null) return;
        out[i].views++; out[i].visitors.add(e.v);
        if (e.m) out[i].members.add(e.m);
      });
      return out.map(r => ({ day: r.day, views: r.views, visitors: r.visitors.size, members: r.members.size }));
    },
    byPage() {
      const map = {};
      this.events().forEach(e => { map[e.p] = (map[e.p] || 0) + 1; });
      return Object.keys(map).map(p => ({ page: p, views: map[p] })).sort((a, b) => b.views - a.views);
    },
    byDevice() {
      const map = {};
      this.events().forEach(e => { map[e.dev] = (map[e.dev] || 0) + 1; });
      return Object.keys(map).map(k => ({ device: k, views: map[k] })).sort((a, b) => b.views - a.views);
    },
    byHour() {
      const out = Array.from({ length: 24 }, (_, h) => ({ hour: h, views: 0 }));
      this.events().forEach(e => { out[new Date(e.t).getHours()].views++; });
      return out;
    },
    totals() {
      const ev = this.events(), v = new Set(), m = new Set();
      ev.forEach(e => { v.add(e.v); if (e.m) m.add(e.m); });
      const now = Date.now();
      return {
        views: ev.length, visitors: v.size, members: m.size,
        last24: ev.filter(e => now - e.t < 86400000).length,
        live: new Set(ev.filter(e => now - e.t < 300000).map(e => e.v)).size,
      };
    },
    clearAll() { try { localStorage.removeItem(EVT); } catch (e) {} },
  };

  window.GAWTelemetry = GAW;
  // auto-track this page load once the module is present
  if (document.readyState === 'complete' || document.readyState === 'interactive') GAW.track();
  else window.addEventListener('DOMContentLoaded', () => GAW.track());
})();
