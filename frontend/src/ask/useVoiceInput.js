import { useCallback, useEffect, useRef, useState } from "react";

const SR = typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
const MOBILE = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || "");
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
  const [error, setError] = useState(null); // null | denied | blocked | nomic | nospeech | network | lang | generic
  const recRef = useRef(null);
  const wantRef = useRef(false); // user wants to keep listening
  const restartsRef = useRef(0);
  const baseRef = useRef(""); // textarea text before this dictation began
  const committedRef = useRef(""); // final words from finished utterances
  const textRef = useRef(text);
  const langRef = useRef(lang);
  const onTextRef = useRef(onText);
  const runRef = useRef(null); // latest runSession, for the restart inside its own onend

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
    rec.continuous = !MOBILE;
    rec.maxAlternatives = 1;
    let sessionFinal = "";
    let gotSpeech = false;

    rec.onresult = (e) => {
      let finals = "";
      let interim = "";
      for (let i = 0; i < e.results.length; i++) {
        const piece = e.results[i][0]?.transcript || "";
        if (e.results[i].isFinal) finals += `${piece} `;
        else interim += `${piece} `;
      }
      sessionFinal = finals.trim();
      if (finals || interim) gotSpeech = true;
      emit(`${finals}${interim}`);
    };

    rec.onerror = (e) => {
      const kind = ERROR_KIND[e.error] || (e.error === "aborted" ? null : "generic");
      // A pause on a phone ends the utterance with "no-speech": keep going if we already heard words.
      if (kind === "nospeech" && (committedRef.current || gotSpeech) && wantRef.current) return;
      if (kind) {
        wantRef.current = false;
        setError(kind);
      }
    };

    rec.onend = () => {
      if (sessionFinal) committedRef.current = `${committedRef.current} ${sessionFinal}`.trim();
      emit("");
      if (wantRef.current && restartsRef.current < MAX_RESTARTS) {
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

  // Language changed while listening → end this utterance (its words are kept) and the
  // normal restart in onend picks up the new language.
  useEffect(() => {
    if (langRef.current === lang) return;
    langRef.current = lang;
    if (!wantRef.current) return;
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
  }, [lang]);

  const toggle = useCallback(() => (listening ? stop() : start()), [listening, start, stop]);

  return { supported: !!SR, listening, error, toggle, start, stop, clearError: () => setError(null) };
}
