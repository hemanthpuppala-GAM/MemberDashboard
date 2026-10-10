import { useEffect, useState } from "react";
import { memberTicketsApi, fullDate, isDone, statusOf, titleOf } from "./memberTickets";
import { BODY, BORDER, GOLD_TEXT, INK, MUTED, card, goldButton, quietButton, textarea } from "./styles";
import { Notice, StarPicker, Stars, StatusPill } from "./ui";

/** One question: the conversation, a reply box, and (once resolved) a 1–5 star rating. */
export default function TicketDetail({ id, onBack, onChanged }) {
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState("");
  const [loadedId, setLoadedId] = useState(null);

  useEffect(() => {
    let alive = true;
    memberTicketsApi
      .get(id)
      .then((t) => alive && (setTicket(t), setError("")))
      .catch((e) =>
        alive &&
        setError(
          /not found|404/i.test(e.message)
            ? "We couldn't find this question in your account. If the email came to a different Google account, sign in with that one."
            : e.message || "Could not load this question.",
        ),
      )
      .finally(() => alive && setLoadedId(id));
    return () => {
      alive = false;
    };
  }, [id]);

  const update = (t) => {
    setTicket(t);
    onChanged?.(t);
  };

  const loading = loadedId !== id;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <button type="button" onClick={onBack} style={{ ...quietButton, alignSelf: "flex-start", border: 0, padding: "0 6px", color: GOLD_TEXT }}>
        ← All my questions
      </button>

      {loading && <p style={{ color: MUTED, fontSize: 15 }}>Loading your question…</p>}
      {!loading && error && <Notice tone="error">{error}</Notice>}

      {!loading && !error && ticket && (
        <>
          <header style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
              <StatusPill status={ticket.status} size={13.5} />
              <span style={{ fontSize: 13, color: MUTED, fontWeight: 600, letterSpacing: ".04em" }}>{ticket.ref || `#${ticket.id}`}</span>
            </div>
            <h2 className="serif" style={{ margin: 0, fontSize: "clamp(26px,6vw,34px)", lineHeight: 1.15, fontWeight: 500, color: INK }}>
              {titleOf(ticket)}
            </h2>
            <p style={{ margin: 0, fontSize: 14.5, color: BODY }}>{statusOf(ticket.status).hint}</p>
          </header>

          <Thread ticket={ticket} />

          {isDone(ticket.status) && <Rating ticket={ticket} onSaved={update} />}

          <ReplyBox ticket={ticket} onSent={update} />
        </>
      )}
    </div>
  );
}

function Bubble({ who, mine, support, at, children }) {
  return (
    <li
      style={{
        alignSelf: mine ? "flex-end" : "flex-start",
        maxWidth: "min(100%, 560px)",
        width: "fit-content",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <span style={{ fontSize: 12.5, fontWeight: 700, color: support ? GOLD_TEXT : MUTED, textAlign: mine ? "right" : "left" }}>
        {who} <span style={{ fontWeight: 500 }}>· {fullDate(at)}</span>
      </span>
      <div
        style={{
          padding: "14px 16px",
          borderRadius: mine ? "18px 18px 6px 18px" : "18px 18px 18px 6px",
          background: mine ? "#F7EFD9" : "#FFFFFF",
          border: `1px solid ${support ? "rgba(201,162,74,.55)" : BORDER}`,
          color: INK,
          fontSize: 15.5,
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
        }}
      >
        {children}
      </div>
    </li>
  );
}

function Thread({ ticket }) {
  const comments = ticket.comments ?? [];
  return (
    <ol aria-label="Conversation" style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 16 }}>
      {ticket.body && (
        <Bubble who="You asked" mine at={ticket.created_at}>
          {ticket.body}
        </Bubble>
      )}
      {comments.map((c) =>
        c.author_type === "system" ? (
          <li key={c.id} style={{ alignSelf: "center", fontSize: 13, color: MUTED, textAlign: "center", padding: "0 12px" }}>
            {c.body} · {fullDate(c.created_at)}
          </li>
        ) : (
          <Bubble
            key={c.id}
            mine={c.author_type === "member"}
            support={c.author_type === "agent"}
            who={c.author_type === "agent" ? "Golden Age Wisdom support" : "You"}
            at={c.created_at}
          >
            {c.body}
          </Bubble>
        ),
      )}
      {comments.length === 0 && (
        <li style={{ fontSize: 14, color: MUTED, textAlign: "center" }}>No replies yet — our team will answer here and by email.</li>
      )}
    </ol>
  );
}

function ReplyBox({ ticket, onSent }) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const done = isDone(ticket.status);

  const send = async (e) => {
    e.preventDefault();
    if (!body.trim()) {
      setError("Please write your message first.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const t = await memberTicketsApi.reply(ticket.id, body.trim());
      setBody("");
      setSent(true);
      onSent(t);
    } catch (err) {
      setError(err.message || "Could not send. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={send}
      style={{ ...card, padding: 18, display: "flex", flexDirection: "column", gap: 12, ...(ticket.status === "waiting" ? { borderColor: "#C9A24A", boxShadow: "0 0 0 3px rgba(232,207,131,.45)" } : null) }}
    >
      <label htmlFor="gaw-reply" className="serif" style={{ fontSize: 22, fontWeight: 600, color: INK }}>
        {ticket.status === "waiting" ? "Your reply is needed" : done ? "Still need help?" : "Add a message"}
      </label>
      {done && <p style={{ margin: 0, fontSize: 14, color: BODY }}>This question is marked {statusOf(ticket.status).label.toLowerCase()}. Sending a message will open it again and our team will reply.</p>}
      <textarea
        id="gaw-reply"
        value={body}
        onChange={(e) => {
          setBody(e.target.value);
          setSent(false);
        }}
        placeholder="Type your message here…"
        maxLength={5000}
        style={textarea}
      />
      {error && <Notice tone="error">{error}</Notice>}
      {sent && !error && <Notice tone="ok">Sent. We'll reply here and by email.</Notice>}
      <button type="submit" disabled={busy} className="gaw-pill-gold" style={{ ...goldButton, alignSelf: "stretch", opacity: busy ? 0.7 : 1 }}>
        {busy ? "Sending…" : done ? "Send and reopen" : "Send message"}
      </button>
    </form>
  );
}

function Rating({ ticket, onSaved }) {
  const [value, setValue] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (ticket.rating) {
    return (
      <section style={{ ...card, padding: 18, display: "flex", flexDirection: "column", gap: 8 }}>
        <h3 className="serif" style={{ margin: 0, fontSize: 22, fontWeight: 600, color: INK }}>
          Thank you for your feedback
        </h3>
        <Stars value={ticket.rating} size={26} />
        {ticket.rating_comment && <p style={{ margin: 0, fontSize: 15, color: BODY, whiteSpace: "pre-wrap" }}>“{ticket.rating_comment}”</p>}
      </section>
    );
  }

  const save = async (e) => {
    e.preventDefault();
    if (!value) {
      setError("Tap a star to choose your rating.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      onSaved(await memberTicketsApi.rate(ticket.id, value, comment.trim()));
    } catch (err) {
      setError(err.message || "Could not save your rating.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} style={{ ...card, padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
      <h3 className="serif" style={{ margin: 0, fontSize: 22, fontWeight: 600, color: INK }}>
        How did we do?
      </h3>
      <p style={{ margin: 0, fontSize: 14, color: BODY }}>Your rating helps our volunteers. It's optional.</p>
      <StarPicker value={value} onChange={setValue} />
      <textarea
        aria-label="Anything you'd like to tell us? (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Anything you'd like to tell us? (optional)"
        maxLength={2000}
        style={{ ...textarea, minHeight: 80 }}
      />
      {error && <Notice tone="error">{error}</Notice>}
      <button type="submit" disabled={busy} style={{ ...quietButton, alignSelf: "flex-start", borderColor: "#C9A24A", opacity: busy ? 0.7 : 1 }}>
        {busy ? "Saving…" : "Send rating"}
      </button>
    </form>
  );
}
