import { useCallback, useEffect, useRef, useState } from "react";

const SR = typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
const UA = typeof navigator !== "undefined" ? navigator.userAgent || "" : "";
const MOBILE = /Android|iPhone|iPad|iPod|Mobile/i.test(UA);
// iPhone/iPad (iPadOS reports as a Mac with touch). Every iOS browser is WebKit; speech
// recognition only really works in Safari, and only when started straight from a tap.
const IOS = /iPhone|iPad|iPod/i.test(UA) || (/Macintosh/.test(UA) && typeof navigator !== "undefined" && navigator.maxTouchPoints > 1);
// Safari itself (not Chrome/Edge/Firefox/Google/in-app browsers, which add their own token).
const IOS_SAFARI = IOS && /Safari/.test(UA) && !/CriOS|FxiOS|EdgiOS|OPiOS|GSA\/|FBAN|FBAV|Instagram|Line\//.test(UA);
const MAX_RESTARTS = 40; // phones end each utterance after a pause; keep listening until the user taps Stop

/** Browser error code → what we tell the user (keys in ASK_PAGE_T: err*). */
const ERROR_KIND = {
  "not-allowed": "denied",
  "service-not-allowed": "denied",
  "audio-capture": "nomic",
  "no-speech": "nospeech",
  network: "network",
  "language-not-supported": "lang",
  "bad-grammar": "generic",
};

function micBlockedByPolicy() {
  try {
    const fp = document.permissionsPolicy || document.featurePolicy;
    return fp?.allowsFeature ? !fp.allowsFeature("microphone") : false;
  } catch {
    return false;
  }
}

/**
 * Web Speech dictation that appends to `text`. `onText(next)` gets the full textarea value
 * (existing text + everything heard so far, interim words included).
 *
 * Built for real phones as well as desktop Chrome:
 * - asks for the microphone first, so a refusal or a missing mic gets a clear message;
 * - on phones runs one utterance at a time and quietly restarts after each pause
 *   (continuous mode repeats words on Android), until the user taps Stop;
 * - switching the language while listening restarts in the new language;
 * - every failure maps to a specific `error` kind instead of a generic "could not hear you".
 */
export function useVoiceInput({ lang, text, onText }) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null); // null | denied | blocked | nomic | nospeech | network | lang | ios | iosdict | generic
  const [notice, setNotice] = useState(null); // null | relang (iPhone: language changed, tap the mic again)
  const recRef = useRef(null);
  const wantRef = useRef(false); // user wants to keep listening
  const restartsRef = useRef(0);
  const baseRef = useRef(""); // textarea text before this dictation began
  const committedRef = useRef(""); // final words from finished utterances
  const textRef = useRef(text);
  const langRef = useRef(lang);
  const onTextRef = useRef(onText);
  const runRef = useRef(null); // latest runSession, for the restart inside its own onend
  const sessionTextRef = useRef(""); // what the current utterance has produced so far (interim included)
  const switchedAtRef = useRef(0); // when the language was last switched mid-listening

  useEffect(() => {
    textRef.current = text;
  }, [text]);
  useEffect(() => {
    onTextRef.current = onText;
  }, [onText]);

  const emit = useCallback((sessionText) => {
    const heard = `${committedRef.current} ${sessionText}`.replace(/\s+/g, " ").trim();
    onTextRef.current(baseRef.current + heard);
  }, []);

  const runSession = useCallback(() => {
    const rec = new SR();
    recRef.current = rec;
    rec.lang = langRef.current;
    rec.interimResults = true;
    // Android repeats words in continuous mode, so it runs one utterance at a time. iOS can't be
    // restarted without a tap, so it stays in one continuous session until Stop.
    rec.continuous = !MOBILE || IOS;
    rec.maxAlternatives = 1;
    let sessionFinal = "";
    let gotSpeech = false;
    sessionTextRef.current = "";
    // A language switch replaces this session with a new one; the old one's late events are ignored.
    const live = () => recRef.current === rec;

    rec.onresult = (e) => {
      if (!live()) return;
      let finals = "";
      let interim = "";
      for (let i = 0; i < e.results.length; i++) {
        const piece = e.results[i][0]?.transcript || "";
        if (e.results[i].isFinal) finals += `${piece} `;
        else interim += `${piece} `;
      }
      sessionFinal = finals.trim();
      if (finals || interim) gotSpeech = true;
      sessionTextRef.current = `${finals}${interim}`.trim();
      emit(`${finals}${interim}`);
    };

    rec.onerror = (e) => {
      if (!live()) return;
      let kind = ERROR_KIND[e.error] || (e.error === "aborted" ? null : "generic");
      // On iPhone the mic was already allowed (getUserMedia ran first), so a refusal here is not
      // a blocked mic: in Safari it means Dictation is switched off in iOS Settings; in other
      // browsers (Edge/Chrome/in-app) there is no speech service at all.
      if (IOS && kind === "denied") {
        // Refused right after a language switch: not a settings problem, just needs one more tap.
        if (Date.now() - switchedAtRef.current < 2000) {
          wantRef.current = false;
          setListening(false);
          setNotice("relang");
          return;
        }
        kind = IOS_SAFARI ? "iosdict" : "ios";
      }
      // A pause on a phone ends the utterance with "no-speech": keep going if we already heard words.
      if (kind === "nospeech" && (committedRef.current || gotSpeech) && wantRef.current) return;
      if (kind) {
        wantRef.current = false;
        setError(kind);
        setListening(false); // never leave the button stuck on "listening" (iOS may not fire onend)
      }
    };

    rec.onend = () => {
      if (!live()) return;
      sessionTextRef.current = "";
      if (sessionFinal) committedRef.current = `${committedRef.current} ${sessionFinal}`.trim();
      emit("");
      if (wantRef.current && !IOS && restartsRef.current < MAX_RESTARTS) {
        restartsRef.current += 1;
        setTimeout(() => {
          if (!wantRef.current) return;
          try {
            runRef.current?.();
          } catch {
            wantRef.current = false;
            setListening(false);
          }
        }, 150);
        return;
      }
      wantRef.current = false;
      setListening(false);
    };

    rec.start();
  }, [emit]);

  useEffect(() => {
    runRef.current = runSession;
  }, [runSession]);

  const stop = useCallback(() => {
    wantRef.current = false;
    try {
      recRef.current?.stop();
    } catch {
      /* already stopped */
    }
    setListening(false);
  }, []);

  useEffect(
    () => () => {
      wantRef.current = false;
      recRef.current?.abort?.();
    },
    [],
  );

  const start = useCallback(async () => {
    if (!SR) return;
    setError(null);
    setNotice(null);
    if (micBlockedByPolicy()) {
      setError("blocked");
      return;
    }
    // Ask for the mic up front: clearer permission prompt and clearer failures than Web Speech gives.
    if (navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
      } catch (e) {
        const name = e?.name || "";
        if (name === "NotFoundError" || name === "OverconstrainedError") setError("nomic");
        else if (name === "SecurityError" && micBlockedByPolicy()) setError("blocked");
        else setError("denied");
        return;
      }
    }
    const current = textRef.current;
    baseRef.current = current ? `${current.replace(/\s+$/, "")} ` : "";
    committedRef.current = "";
    restartsRef.current = 0;
    wantRef.current = true;
    try {
      runSession();
      setListening(true);
    } catch {
      wantRef.current = false;
      setError("generic");
    }
  }, [runSession]);

  useEffect(() => {
    langRef.current = lang;
  }, [lang]);

  /**
   * Call from the language tap itself (before/with changing `lang`). While listening, the words
   * heard so far are kept and a new session starts at once in the new language — inside the tap,
   * which iOS requires — so switching back and forth any number of times never stops the mic.
   */
  const switchLang = useCallback(
    (next) => {
      if (langRef.current === next) return;
      langRef.current = next;
      setNotice(null);
      if (!wantRef.current) return;
      const old = recRef.current;
      committedRef.current = `${committedRef.current} ${sessionTextRef.current}`.replace(/\s+/g, " ").trim();
      sessionTextRef.current = "";
      recRef.current = null; // old session's late events are now ignored
      try {
        old?.abort?.();
      } catch {
        /* already ended */
      }
      switchedAtRef.current = Date.now();
      restartsRef.current = 0;
      try {
        runSession();
      } catch {
        wantRef.current = false;
        setListening(false);
        setNotice("relang");
      }
    },
    [runSession],
  );

  const toggle = useCallback(() => (listening ? stop() : start()), [listening, start, stop]);

  // iPhone browsers other than Safari have no speech service: use the keyboard's 🎤 instead.
  return { supported: !!SR, keyboardOnly: IOS && !IOS_SAFARI, listening, error, notice, toggle, start, stop, switchLang, clearError: () => setError(null) };
}
