import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import logo from "../assets/logo-coin-tight.png";
import { useMemberAuth } from "../auth/MemberAuthContext";
import BrandedQr from "../ask/BrandedQr";
import { ASK_PAGE_T, PAGE_LANGS, VOICE_LANGS } from "../ask/copy";
import { submitQuestion } from "../ask/submitQuestion";
import { useSupportNumbers, whatsappUrl } from "../ask/support";
import { fill, primaryButtonClass, textareaClass } from "../ask/styles";
import { Chip, SentStatus, StepLabel } from "../ask/ui";
import { useVoiceInput } from "../ask/useVoiceInput";

const LANG_KEY = "gaw_ask_lang";

function voiceErrorText(t, kind, voiceLang) {
  const label = VOICE_LANGS.find((l) => l.code === voiceLang)?.label || voiceLang;
  const map = { denied: t.errDenied, blocked: t.errBlocked, nomic: t.errNoMic, nospeech: t.errNoSpeech, network: t.errNetwork, lang: fill(t.errLang, { lang: label }) };
  return map[kind] || t.voiceErr;
}

function MicIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  );
}

function initialLang(param) {
  if (PAGE_LANGS.some((l) => l.code === param)) return param;
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (PAGE_LANGS.some((l) => l.code === saved)) return saved;
  } catch {
    /* storage blocked — default below */
  }
  return "en";
}

/** Public "Ask a question" page — the QR target. No login; members get an acknowledgement email. */
export default function AskPage() {
  const [params] = useSearchParams();
  const { user } = useMemberAuth();
  const support = useSupportNumbers();

  const [lang, setLang] = useState(() => initialLang(params.get("lang")));
  const [voiceLang, setVoiceLang] = useState(() => PAGE_LANGS.find((l) => l.code === lang).voice);
  const [text, setText] = useState("");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const [ack, setAck] = useState(null);
  const t = ASK_PAGE_T[lang];

  const voice = useVoiceInput({ lang: voiceLang, text, onText: setText });

  useEffect(() => {
    document.title = `${ASK_PAGE_T[lang].title} · Golden Age Wisdom`;
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      /* not critical */
    }
  }, [lang]);

  const pickPageLang = (l) => {
    voice.stop();
    setLang(l.code);
    setVoiceLang(l.voice);
  };

  const pickVoiceLang = (code) => {
    voice.clearError();
    setVoiceLang(code);
  };

  const send = () => {
    const question = text.trim();
    if (!question) {
      setNote(t.empty);
      setSent(false);
      return;
    }
    voice.stop();
    window.open(
      whatsappUrl(support.web, {
        question,
        via: user ? "member" : "QR/web",
        name: user?.name,
        memberId: user?.id,
        email: user?.email,
      }),
      "_blank",
      "noopener",
    );
    setNote(t.opening);
    setSent(true);
    setAck(user?.email ? { state: "sending", email: user.email } : null);

    submitQuestion({ member: user, question, lang })
      .then((res) => user?.email && setAck({ state: res?.ack_sent ? "sent" : "failed", email: user.email }))
      .catch(() => user?.email && setAck({ state: "failed", email: user.email }));
  };

  const pageUrl = `${window.location.origin}${import.meta.env.BASE_URL}ask`;
  const memberInitial = (user?.name?.trim()[0] || "M").toUpperCase();

  return (
    <div className="min-h-dvh bg-[#F3EAD3] ask-font font-medium text-[#1B3328] antialiased">
      <div className="mx-auto flex w-full max-w-[560px] flex-col gap-[22px] px-[18px] pt-7 pb-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="" className="h-10 w-10 rounded-full" />
            <span className="font-headline text-[18px] font-bold text-[#14241C]">Golden Age Wisdom</span>
          </Link>
          <div className="flex gap-1.5">
            {PAGE_LANGS.map((l) => (
              <Chip key={l.code} selected={lang === l.code} onClick={() => pickPageLang(l)} className="px-3.5">
                {l.label}
              </Chip>
            ))}
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-2.5 rounded-[14px] border border-[rgba(201,162,74,0.3)] bg-[rgba(201,162,74,0.12)] px-3.5 py-2.5 text-[13px] text-[#2E3A33]">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#14241C] font-headline text-[14px] font-bold text-[#E8CF83]">
              {memberInitial}
            </span>
            <span>
              {t.signedInAs} <strong>{user.name}</strong> · {t.ackPromise}
            </span>
          </div>
        )}

        <div>
          <h1 className="m-0 font-headline text-[40px] leading-[1.05] font-bold text-[#14241C]">{t.title}</h1>
          <p className="mt-2 mb-0 text-[15px] leading-[1.6] text-[#2E3A33]">{t.intro}</p>
        </div>

        {/* Voice first: the big mic sits above the fold on every device, with a nudge for first-timers. */}
        {voice.supported ? (
          <div className="flex flex-col gap-2.5 rounded-[22px] border border-[rgba(201,162,74,0.45)] bg-[#FFFDF8] p-3.5 shadow-[0_10px_28px_-16px_rgba(60,42,16,0.45)]">
            {!voice.listening && !voice.error && !text && (
              <span className="inline-flex items-center gap-2 self-start rounded-full bg-[rgba(201,162,74,0.18)] px-3 py-1.5 text-[13px] font-semibold text-[#7A5E22]">
                <span aria-hidden="true">✨</span>
                {t.micHint}
              </span>
            )}
            <button
              type="button"
              onClick={voice.toggle}
              aria-pressed={voice.listening}
              className={`inline-flex min-h-[56px] w-full cursor-pointer items-center justify-center gap-3 rounded-full px-5 text-[17px] font-bold transition-colors ${
                voice.listening
                  ? "animate-[micPulse_1.2s_ease-out_infinite] bg-[#A8403F] text-white"
                  : `bg-[#14241C] text-[#F6F1E6] hover:bg-[#1B3328] ${!text && !voice.error ? "animate-[micPulse_2.4s_ease-out_infinite]" : ""}`
              }`}
            >
              {voice.listening ? (
                <span aria-hidden="true" className="h-3.5 w-3.5 rounded-[3px] bg-white" />
              ) : (
                <MicIcon />
              )}
              {voice.listening ? t.micStop : t.mic}
            </button>
            <p aria-live="polite" className={`m-0 min-h-[1.2em] text-[13px] leading-[1.45] ${voice.error ? "font-semibold text-[#A8403F]" : "text-[#5A5546]"}`}>
              {voice.error ? voiceErrorText(t, voice.error, voiceLang) : voice.listening ? t.listeningHint : ""}
            </p>
            <div className="flex flex-col gap-1.5">
              <span className="text-[12px] text-[#5A5546]">{t.speakIn}</span>
              <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
                {VOICE_LANGS.map((l) => (
                  <Chip key={l.code} selected={voiceLang === l.code} onClick={() => pickVoiceLang(l.code)} className="shrink-0 whitespace-nowrap">
                    {l.label}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="m-0 rounded-[14px] bg-[rgba(201,162,74,0.12)] px-3.5 py-2.5 text-[13px] text-[#5A5546]">{t.noVoice}</p>
        )}

        <div className="flex flex-col gap-2">
          <StepLabel>{t.step1}</StepLabel>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setNote("");
            }}
            placeholder={t.hint}
            rows={4}
            aria-label={t.step1}
            className={`${textareaClass} text-[16px]`}
          />
        </div>

        <div className="flex flex-col gap-2">
          <StepLabel>{t.step2}</StepLabel>
          <button type="button" onClick={send} className={`${primaryButtonClass} w-full p-4 text-[16px]`}>
            {t.sendBtn}
          </button>
          <span className="text-center text-[12.5px] text-[#2E3A33]">{fill(t.number, { primary: support.primaryDisplay })}</span>
          {note && !sent && <span className="text-center text-[13px] font-semibold text-[#A8403F]">{note}</span>}
          {note && sent && <SentStatus note={note} ack={ack} t={t} className="items-center text-center" />}
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-[20px] border border-[rgba(201,162,74,0.3)] bg-[#FFFDF8] p-[18px]">
          <a
            href={pageUrl}
            title="Open the Ask page"
            className="block shrink-0 rounded-[18px] border-2 border-[rgba(184,146,62,0.55)] bg-[#FFFDF8] p-1.5 shadow-[0_6px_18px_rgba(20,36,28,0.08)]"
          >
            <BrandedQr value={pageUrl} alt="Scan or tap to ask Golden Age Wisdom" className="block h-32 w-32 rounded-xl" />
          </a>
          <div className="flex min-w-[180px] flex-1 flex-col gap-1.5">
            <span className="font-headline text-[20px] font-bold text-[#14241C]">{t.qrTitle}</span>
            <span className="text-[13px] leading-[1.55] text-[#2E3A33]">{t.qrBody}</span>
            <div className="flex flex-wrap gap-3.5">
              <Link to="/ask/poster" className="text-[12.5px] font-semibold text-[#7A5E22] underline underline-offset-[3px] hover:text-[#14241C]">
                {t.qrPoster}
              </Link>
              <Link to="/ask/zoom" className="text-[12.5px] font-semibold text-[#7A5E22] underline underline-offset-[3px] hover:text-[#14241C]">
                {t.qrZoom}
              </Link>
            </div>
          </div>
        </div>

        <p className="m-0 text-[12px] leading-[1.6] font-normal text-[#5A5546]">{t.footnote}</p>
      </div>
    </div>
  );
}
