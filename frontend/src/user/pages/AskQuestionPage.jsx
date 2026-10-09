import { useState } from "react";
import { Link } from "react-router-dom";
import { QrCode } from "lucide-react";
import { useMemberAuth } from "../../auth/MemberAuthContext";
import { ASK_TOPICS, MEMBER_ASK_T } from "../../ask/copy";
import { submitQuestion } from "../../ask/submitQuestion";
import { useSupportNumbers, whatsappUrl } from "../../ask/support";
import { fill, primaryButtonClass, textareaClass } from "../../ask/styles";
import { Chip, SentStatus, StepLabel } from "../../ask/ui";

/** Member "Ask a question" tab — topic → question → WhatsApp, plus a server-sent acknowledgement email. */
export default function AskQuestionPage() {
  const { user } = useMemberAuth();
  const support = useSupportNumbers();
  const [lang, setLang] = useState("en");
  const [topic, setTopic] = useState(null);
  const [text, setText] = useState("");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const [ack, setAck] = useState(null);
  const t = MEMBER_ASK_T[lang];

  const send = () => {
    const question = text.trim();
    if (!question) {
      setNote(t.emptyNote);
      setSent(false);
      return;
    }
    const topicLabel = topic ? MEMBER_ASK_T.en.topics[topic.key] : null;
    window.open(
      whatsappUrl(support.web, {
        question: topicLabel ? `[${topicLabel}] ${question}` : question,
        via: "member",
        name: user?.name,
        memberId: user?.id,
        email: user?.email,
      }),
      "_blank",
      "noopener",
    );
    setNote(t.openNote);
    setSent(true);
    setAck(user?.email ? { state: "sending", email: user.email } : null);

    submitQuestion({ member: user, question, category: topic?.category, topicLabel, lang })
      .then((res) => user?.email && setAck({ state: res?.ack_sent ? "sent" : "failed", email: user.email }))
      .catch(() => user?.email && setAck({ state: "failed", email: user.email }));
  };

  return (
    <div className="ask-font flex max-w-[940px] flex-col gap-[30px] font-medium">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="m-0 font-headline text-[36px] leading-none font-bold text-[#14241C] sm:text-[44px]">{t.title}</h2>
          <p className="mt-1.5 mb-0 text-[15px] text-[#2E3A33]">{t.sub}</p>
        </div>
        <button
          type="button"
          onClick={() => setLang(lang === "en" ? "te" : "en")}
          className="min-h-[44px] cursor-pointer rounded-full border border-[rgba(201,162,74,0.6)] bg-transparent px-4 py-2 text-[13px] font-semibold text-[#7A5E22] hover:bg-[rgba(201,162,74,0.12)]"
        >
          {t.langBtn}
        </button>
      </div>

      <div className="flex flex-col gap-3.5">
        <p className="m-0 max-w-[620px] text-[15px] leading-[1.65] text-[#2E3A33]">{t.intro}</p>

        <div className="flex flex-col gap-1.5">
          <StepLabel>{t.step1}</StepLabel>
          <div className="flex flex-wrap gap-2">
            {ASK_TOPICS.map((tp) => (
              <Chip key={tp.key} selected={topic?.key === tp.key} onClick={() => setTopic(topic?.key === tp.key ? null : tp)} className="text-[13px]">
                {t.topics[tp.key]}
              </Chip>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <StepLabel>{t.step2}</StepLabel>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setNote("");
            }}
            placeholder={t.hint}
            rows={4}
            aria-label={t.step2}
            className={`${textareaClass} max-w-[720px] !border-[rgba(138,111,52,0.22)] !bg-[rgba(20,36,28,0.05)] text-[15px]`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <StepLabel>{t.step3}</StepLabel>
          <div className="flex flex-wrap items-center gap-2.5">
            <button type="button" onClick={send} className={`${primaryButtonClass} min-h-[44px] px-[26px] py-[13px] text-[14px]`}>
              {t.sendBtn}
            </button>
            <span className="text-[12.5px] text-[#2E3A33]">{fill(t.number, { primary: support.primaryDisplay })}</span>
          </div>
          {note && !sent && <span className="text-[13px] font-semibold text-[#A8403F]">{note}</span>}
        </div>

        {note && sent && <SentStatus note={note} ack={ack} t={t} className="max-w-[720px] rounded-2xl px-[18px] py-4" />}

        <p className="mt-1 mb-0 max-w-[620px] text-[12px] leading-[1.6] font-normal text-[#5A5546]">{t.footnote}</p>
        <Link
          to="/ask"
          className="inline-flex items-center gap-2.5 self-start rounded-2xl border border-[rgba(201,162,74,0.3)] bg-[#FFFDF8] px-4 py-3 text-[13px] text-[#2E3A33] hover:text-[#14241C]"
        >
          <QrCode size={18} className="text-[#7A5E22]" />
          <span>{t.qrLink}</span>
        </Link>
      </div>
    </div>
  );
}
