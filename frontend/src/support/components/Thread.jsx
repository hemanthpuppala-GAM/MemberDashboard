import { Lock } from "lucide-react";
import { formatDateTime } from "../format";

/** The conversation: member messages, replies, internal notes (amber), and system events. */
export default function Thread({ comments = [] }) {
  if (!comments.length) {
    return <p className="rounded-xl bg-[rgba(255,253,248,0.6)] px-4 py-3 text-[14px] text-[#5A5546]">No replies or notes yet.</p>;
  }
  return (
    <ol className="m-0 flex list-none flex-col gap-2.5 p-0">
      {comments.map((c) => (
        <Comment key={c.id} c={c} />
      ))}
    </ol>
  );
}

function Comment({ c }) {
  if (c.author_type === "system") {
    return (
      <li className="px-2 text-center text-[12.5px] text-[#5A5546]">
        {c.body} <span className="whitespace-nowrap">· {formatDateTime(c.created_at)}</span>
      </li>
    );
  }

  const fromMember = c.author_type === "member";
  const style = c.internal
    ? "border-[rgba(201,150,40,0.55)] bg-[#FFF3D1]"
    : fromMember
      ? "border-[rgba(138,111,52,0.2)] bg-[#FFFDF8]"
      : "border-[rgba(47,107,69,0.25)] bg-[#EEF4EC]";

  return (
    <li className={`rounded-2xl border px-4 py-3 ${style} ${fromMember ? "mr-6 sm:mr-12" : "ml-6 sm:ml-12"}`}>
      {c.internal && (
        <p className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-[#8A5A00]">
          <Lock size={13} aria-hidden /> Internal note — not shown to member
        </p>
      )}
      <div className="flex flex-wrap items-baseline gap-x-2 text-[12.5px] text-[#5A5546]">
        <span className="font-semibold text-[#14241C]">{c.author_name}</span>
        <span>{fromMember ? "(member)" : c.internal ? "" : "replied to member"}</span>
        <span className="ml-auto">{formatDateTime(c.created_at)}</span>
      </div>
      <p className="mt-1 whitespace-pre-wrap break-words text-[14.5px] leading-relaxed text-[#2E3A33]">{c.body}</p>
    </li>
  );
}
