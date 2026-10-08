import { useCallback, useEffect, useRef, useState } from "react";

const SR = typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

/**
 * Web Speech dictation that appends to `text`. `onText(next)` receives the full
 * textarea value (existing text + everything heard so far, interim results included).
 */
export function useVoiceInput({ lang, text, onText }) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(false);
  const recRef = useRef(null);
  const textRef = useRef(text);

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  const stop = useCallback(() => recRef.current?.stop(), []);

  useEffect(() => () => recRef.current?.abort(), []);

  const start = useCallback(() => {
    if (!SR) return;
    const rec = new SR();
    recRef.current = rec;
    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = true;
    const current = textRef.current;
    const base = current ? `${current.replace(/\s+$/, "")} ` : "";
    rec.onresult = (e) => {
      let heard = "";
      for (let i = 0; i < e.results.length; i++) heard += `${e.results[i][0].transcript} `;
      onText(base + heard.trim());
    };
    rec.onerror = () => {
      setError(true);
      setListening(false);
    };
    rec.onend = () => setListening(false);
    try {
      rec.start();
      setError(false);
      setListening(true);
    } catch {
      setError(true);
    }
  }, [lang, onText]);

  const toggle = useCallback(() => (listening ? stop() : start()), [listening, start, stop]);

  return { supported: !!SR, listening, error, toggle, stop };
}
