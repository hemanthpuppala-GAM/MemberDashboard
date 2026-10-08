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
    voice.stop();
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

        <div className="flex flex-col gap-2">
          <StepLabel>{t.step1}</StepLabel>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setNote("");
            }}
            placeholder={t.hint}
            rows={5}
            aria-label={t.step1}
            className={`${textareaClass} text-[16px]`}
          />
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] text-[#5A5546]">{t.speakIn}</span>
            <div className="flex flex-wrap gap-1.5">
              {VOICE_LANGS.map((l) => (
                <Chip key={l.code} selected={voiceLang === l.code} onClick={() => pickVoiceLang(l.code)}>
                  {l.label}
                </Chip>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {voice.supported && (
              <button
                type="button"
                onClick={voice.toggle}
                className={`inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full border px-[18px] py-3 text-[14px] font-semibold ${
                  voice.listening
                    ? "animate-[micPulse_1.2s_ease-out_infinite] border-[rgba(168,64,63,0.6)] bg-[rgba(168,64,63,0.1)] text-[#A8403F]"
                    : "border-[rgba(138,111,52,0.35)] bg-transparent text-[#1B3328]"
                }`}
              >
                <span aria-hidden="true" className="text-[16px]">●</span>
                {voice.listening ? t.micStop : t.mic}
              </button>
            )}
            {(!voice.supported || voice.error) && (
              <span className="text-[12.5px] text-[#5A5546]">{voice.supported ? t.voiceErr : t.noVoice}</span>
            )}
          </div>
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
