import { siteAsset } from "../site/siteAssets";

/**
 * Background sounds for "Your own sit", the same six the old site offered. Aum and the flute are
 * recordings; the bowl, bells and birdsong are synthesised once into a seamless WAV loop and played
 * through an <audio> element (iOS silences bare WebAudio output but never a media element).
 */
export const SIT_SOUNDS = [
  { key: "om", label: "Aum drone", glyph: "ॐ", src: "assets/sounds/aum-drone.wav" },
  { key: "flute", label: "Temple flute", glyph: "♪", src: "assets/sounds/temple-flute.wav" },
  { key: "bowl", label: "Singing bowl", glyph: "◎", synth: "bowl" },
  { key: "bells", label: "Temple bells", glyph: "❈", synth: "bells" },
  { key: "birds", label: "Dawn birdsong", glyph: "✧", synth: "birds" },
  { key: "off", label: "Pure silence", glyph: "○" },
];

const urls = {};

/** A playable URL for the sound, or null for silence (or if this browser can't render it). */
export async function soundUrl(key) {
  const sound = SIT_SOUNDS.find((s) => s.key === key);
  if (!sound || key === "off") return null;
  if (sound.src) return siteAsset(sound.src);
  if (urls[key]) return urls[key];
  const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (!OAC) return null;
  const sr = 44100;
  const dur = key === "birds" ? 18 : key === "bells" ? 28 : 24;
  const ctx = new OAC(1, Math.floor(sr * dur), sr);
  const out = ctx.createGain();
  out.gain.value = 0.9;
  out.connect(ctx.destination);
  if (key === "bowl") renderBowl(ctx, out, dur);
  else if (key === "bells") renderBells(ctx, out, dur);
  else renderBirds(ctx, out, dur);
  const buf = await ctx.startRendering();
  urls[key] = URL.createObjectURL(wavBlob(buf));
  return urls[key];
}

/** Two soft bell strikes and a buzz: the sit is complete. */
export function chime() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) {
      const ctx = new AC();
      if (ctx.state === "suspended") ctx.resume();
      [0, 3.1].forEach((delay) => {
        const t = ctx.currentTime + delay;
        [
          [1, 0.42, 7],
          [2.76, 0.15, 4.5],
          [5.4, 0.06, 2.6],
        ].forEach(([mult, amp, dec]) => {
          const o = ctx.createOscillator();
          o.type = "sine";
          o.frequency.value = 196 * mult;
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.0001, t);
          g.gain.linearRampToValueAtTime(amp, t + 0.03);
          g.gain.exponentialRampToValueAtTime(0.0001, t + dec);
          o.connect(g);
          g.connect(ctx.destination);
          o.start(t);
          o.stop(t + dec + 0.2);
        });
      });
      setTimeout(() => ctx.close?.(), 11000);
    }
  } catch {
    /* no sound available */
  }
  try {
    navigator.vibrate?.([90, 120, 90]);
  } catch {
    /* no vibration */
  }
}

function wavBlob(buf) {
  const d = buf.getChannelData(0);
  const n = d.length;
  const ab = new ArrayBuffer(44 + n * 2);
  const v = new DataView(ab);
  const str = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  str(0, "RIFF");
  v.setUint32(4, 36 + n * 2, true);
  str(8, "WAVEfmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, buf.sampleRate, true);
  v.setUint32(28, buf.sampleRate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  str(36, "data");
  v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, d[i])) * 32767, true);
  return new Blob([ab], { type: "audio/wav" });
}

function strikeAt(ctx, out, t, root, parts, dec) {
  parts.forEach(([mul, amp, d]) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = root * mul;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(amp, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d * dec);
    osc.connect(g);
    g.connect(out);
    osc.start(t);
    osc.stop(t + d * dec + 0.05);
  });
}

// Singing bowl: struck every 8s over a faint sustaining hum, so something is always sounding.
function renderBowl(ctx, out, dur) {
  const hum = ctx.createGain();
  hum.gain.value = 0.06;
  hum.connect(out);
  [211, 211.7, 316.5].forEach((hz, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = hz;
    g.gain.value = i === 2 ? 0.34 : 1;
    o.connect(g);
    g.connect(hum);
    o.start(0);
    o.stop(dur);
  });
  for (let t = 0; t < dur - 2; t += 8) {
    strikeAt(ctx, out, t, 211, [[1, 0.34, 1], [2.01, 0.15, 0.7], [2.71, 0.09, 0.5], [4.06, 0.05, 0.34], [5.42, 0.028, 0.24]], 8.5);
    strikeAt(ctx, out, t + 0.004, 212.6, [[1, 0.16, 1]], 8.5); // detuned twin: the bowl's beating shimmer
  }
}

function renderBells(ctx, out, dur) {
  const roots = [329.6, 392, 440, 493.9];
  for (let i = 0, t = 0; t < dur - 2; i++, t += 7) {
    strikeAt(ctx, out, t, roots[i % 4], [[1, 0.4, 1], [2.76, 0.16, 0.62], [5.4, 0.06, 0.36], [8.9, 0.03, 0.2]], 6.5);
  }
}

function renderBirds(ctx, out, dur) {
  const len = Math.floor(ctx.sampleRate * 4);
  const nb = ctx.createBuffer(1, len, ctx.sampleRate);
  const nd = nb.getChannelData(0);
  let a = 0;
  let b = 0;
  let c = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    a = 0.99 * a + w * 0.05;
    b = 0.96 * b + w * 0.09;
    c = 0.78 * c + w * 0.22;
    nd[i] = Math.max(-1, Math.min(1, (a + b + c) * 0.72));
  }
  const src = ctx.createBufferSource();
  const f = ctx.createBiquadFilter();
  const body = ctx.createGain();
  src.buffer = nb;
  src.loop = true;
  f.type = "bandpass";
  f.frequency.value = 520;
  f.Q.value = 0.4;
  body.gain.value = 0.12;
  src.connect(f);
  f.connect(body);
  body.connect(out);
  src.start(0);
  src.stop(dur);
  const soft = ctx.createBiquadFilter();
  soft.type = "lowpass";
  soft.frequency.value = 6200;
  soft.connect(out);
  const rnd = (x, y) => x + Math.random() * (y - x);
  const chirp = (t, f0, f1, l, amp) => {
    if (t + l > dur - 0.2) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(f0, t);
    osc.frequency.exponentialRampToValueAtTime(f1, t + l);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(amp, t + l * 0.22);
    g.gain.exponentialRampToValueAtTime(0.0001, t + l);
    osc.connect(g);
    g.connect(soft);
    osc.start(t);
    osc.stop(t + l + 0.05);
  };
  let t = 0.4;
  while (t < dur - 1.5) {
    const n = Math.round(rnd(2, 5));
    const up = Math.random() > 0.45;
    const base = rnd(2100, 3900);
    const amp = rnd(0.1, 0.2);
    for (let i = 0; i < n; i++) {
      const l = rnd(0.07, 0.16);
      const f0 = base * rnd(0.94, 1.08);
      chirp(t, up ? f0 : f0 * 1.5, up ? f0 * rnd(1.3, 1.9) : f0 * rnd(0.6, 0.82), l, amp);
      t += l + rnd(0.05, 0.14);
    }
    if (Math.random() > 0.6) {
      const fb = rnd(1500, 2400);
      chirp(t + rnd(0.3, 0.8), fb, fb * rnd(1.2, 1.6), rnd(0.1, 0.2), amp * 0.45);
    }
    t += rnd(1.4, 3.2);
  }
}
