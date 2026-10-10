import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useMemberAuth } from "../auth/MemberAuthContext";
import { oauthRedirectUrl } from "../lib/memberAuth";
import { SitePage, SiteHeader, Breadcrumb } from "../site/SiteChrome";
import { useSupportNumbers } from "../ask/support";
import { memberTicketsApi, timeAgo, titleOf } from "./memberTickets";
import { BODY, BORDER, GOLD_TEXT, INK, MUTED, card, goldButton, quietButton } from "./styles";
import { Notice, StatusPill } from "./ui";
import TicketDetail from "./TicketDetail";

/** /support/my — a signed-in member follows their questions (the support emails link to ?ticket=ID). */
export default function MyQuestionsPage() {
  const { user, loading } = useMemberAuth();
  const [params, setParams] = useSearchParams();
  const openId = params.get("ticket");

  return (
    <SitePage>
      <SiteHeader />
      <Breadcrumb current="My questions" />
      <main style={{ width: "100%", maxWidth: 760, margin: "0 auto", padding: "20px 16px 56px", display: "flex", flexDirection: "column", gap: 22 }}>
        {!openId && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <h1 className="serif" style={{ margin: 0, fontSize: "clamp(34px,8vw,48px)", lineHeight: 1.05, fontWeight: 500, color: INK }}>
              My questions
            </h1>
            <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.6, color: BODY }}>Everything you have asked us, and our replies, in one place.</p>
          </div>
        )}

        {loading ? (
          <p style={{ color: MUTED, fontSize: 15 }}>Loading…</p>
        ) : !user ? (
          <SignedOut />
        ) : (
          <SignedIn user={user} openId={openId} setParams={setParams} />
        )}

        <HelpLine />
      </main>
    </SitePage>
  );
}

function SignedOut() {
  const { pathname, search } = useLocation();
  const [busy, setBusy] = useState(false);

  const signIn = () => {
    setBusy(true);
    try {
      // AuthCallbackPage sends the member back here (incl. ?ticket=) after Google.
      sessionStorage.setItem("gaw_after_signin", `${pathname}${search}`);
    } catch {
      /* storage blocked — they'll land on the dashboard instead */
    }
    window.location.href = oauthRedirectUrl("google");
  };

  return (
    <section style={{ ...card, padding: "28px 22px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
      <h2 className="serif" style={{ margin: 0, fontSize: "clamp(24px,6vw,30px)", lineHeight: 1.2, fontWeight: 500, color: INK }}>
        Sign in with Google to see your questions
      </h2>
      <p style={{ margin: 0, maxWidth: 440, fontSize: 15, lineHeight: 1.6, color: BODY }}>
        Use the same Google account you used when you asked. Your questions and our replies will be waiting for you.
      </p>
      <button type="button" onClick={signIn} disabled={busy} className="gaw-pill-gold" style={{ ...goldButton, width: "100%", maxWidth: 340, opacity: busy ? 0.7 : 1 }}>
        <GoogleMark />
        {busy ? "Opening Google…" : "Sign in with Google"}
      </button>
      <Link to="/ask" style={{ display: "inline-flex", alignItems: "center", minHeight: 44, fontSize: 14.5, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}>
        Have a new question? Ask here
      </Link>
    </section>
  );
}

const ORDER = { waiting: 0, open: 1, in_progress: 1, resolved: 2, closed: 3 };

function SignedIn({ user, openId, setParams }) {
  const { logout } = useMemberAuth();
  const [tickets, setTickets] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    memberTicketsApi
      .list()
      .then((rows) => {
        setTickets(Array.isArray(rows) ? rows : rows?.data ?? []);
        setError("");
      })
      .catch((e) => setError(e.message || "Could not load your questions."));
  }, []);

  useEffect(() => {
    if (!openId) load();
  }, [openId, load]);

  const sorted = useMemo(
    () =>
      [...(tickets ?? [])].sort(
        (a, b) => (ORDER[a.status] ?? 1) - (ORDER[b.status] ?? 1) || new Date(b.updated_at) - new Date(a.updated_at),
      ),
    [tickets],
  );
  const waiting = sorted.filter((t) => t.status === "waiting").length;

  const open = (id) => {
    setParams(id ? { ticket: String(id) } : {});
    window.scrollTo({ top: 0 });
  };

  const changed = (t) => setTickets((rows) => rows && rows.map((r) => (r.id === t.id ? { ...r, ...t } : r)));

  if (openId) {
    return <TicketDetail id={openId} onBack={() => open(null)} onChanged={changed} />;
  }

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8, fontSize: 13.5, color: MUTED }}>
        <span style={{ minWidth: 0, overflowWrap: "anywhere" }}>
          Signed in as <strong style={{ color: INK }}>{user.name}</strong>
          {user.email ? ` (${user.email})` : ""}
        </span>
        <button type="button" onClick={logout} style={{ ...quietButton, border: 0, padding: "0 6px", fontSize: 13.5, color: GOLD_TEXT, textDecoration: "underline" }}>
          Not you? Sign out
        </button>
      </div>

      {waiting > 0 && (
        <Notice>
          <strong>
            {waiting === 1 ? "One question is" : `${waiting} questions are`} waiting for your reply.
          </strong>{" "}
          Open {waiting === 1 ? "it" : "them"} to see our answer and reply.
        </Notice>
      )}

      {error && <Notice tone="error">{error}</Notice>}
      {!error && tickets === null && <p style={{ color: MUTED, fontSize: 15 }}>Loading your questions…</p>}

      {tickets && sorted.length === 0 && (
        <section style={{ ...card, padding: "26px 22px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <h2 className="serif" style={{ margin: 0, fontSize: 26, fontWeight: 500, color: INK }}>
            You haven't asked anything yet
          </h2>
          <p style={{ margin: 0, fontSize: 15, color: BODY }}>When you ask us a question, you can follow it here.</p>
          <Link to="/ask" className="gaw-pill-gold" style={{ ...goldButton, textDecoration: "none" }}>
            Ask a question
          </Link>
        </section>
      )}

      {sorted.length > 0 && (
        <ul aria-label="Your questions" style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          {sorted.map((t) => (
            <li key={t.id}>
              <TicketRow ticket={t} onOpen={() => open(t.id)} />
            </li>
          ))}
        </ul>
      )}

      {sorted.length > 0 && (
        <Link to="/ask" style={{ alignSelf: "center", display: "inline-flex", alignItems: "center", minHeight: 44, fontSize: 14.5, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}>
          Ask another question
        </Link>
      )}
    </>
  );
}

function TicketRow({ ticket, onOpen }) {
  const waiting = ticket.status === "waiting";
  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        ...card,
        width: "100%",
        minHeight: 64,
        padding: "16px 18px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        textAlign: "left",
        font: "inherit",
        color: INK,
        cursor: "pointer",
        borderColor: waiting ? "#C9A24A" : BORDER,
        borderWidth: waiting ? 2 : 1,
        background: waiting ? "#FFF8E6" : card.background,
      }}
    >
      <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
          <StatusPill status={ticket.status} />
          <span style={{ fontSize: 12.5, color: MUTED, fontWeight: 600 }}>{ticket.ref || `#${ticket.id}`}</span>
        </span>
        <span style={{ fontSize: 16.5, fontWeight: 600, lineHeight: 1.35, overflowWrap: "anywhere" }}>{titleOf(ticket)}</span>
        <span style={{ fontSize: 13, color: MUTED }}>Last update {timeAgo(ticket.updated_at)}</span>
      </span>
      <span aria-hidden="true" style={{ fontSize: 22, color: GOLD_TEXT }}>
        ›
      </span>
    </button>
  );
}

function HelpLine() {
  const support = useSupportNumbers();
  return (
    <p style={{ margin: "8px 0 0", textAlign: "center", fontSize: 13.5, lineHeight: 1.6, color: MUTED }}>
      Prefer to talk to someone? Call or WhatsApp{" "}
      <a href={`tel:+${support.primary}`} style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
        {support.primaryDisplay}
      </a>
    </p>
  );
}

function GoogleMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true" style={{ background: "#fff", borderRadius: 999, padding: 2 }}>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.8 6C12.4 13.7 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.8c4.3-4 6.9-9.9 6.9-17.2z" />
      <path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-3-.8-4.7s.3-3.2.8-4.7l-7.8-6C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.8-6z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.8c-2.1 1.4-4.8 2.3-8.5 2.3-6.3 0-11.6-4.2-13.5-9.9l-7.8 6C6.6 42.6 14.6 48 24 48z" />
    </svg>
  );
}
