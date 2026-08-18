import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Megaphone } from "lucide-react";
import Card from "../../ui/Card";
import EmptyState from "../../ui/EmptyState";
import { StatusBadge } from "../../ui/Badge";
import { practitionerApi } from "../../../lib/api";

export default function MyAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    practitionerApi.announcements()
      .then((list) => {
        setAnnouncements(list);
        list.filter((a) => !a.read).forEach((a) => practitionerApi.markAnnouncementRead(a.id).catch(() => {}));
      })
      .catch((err) => toast.error(err.message ?? "Failed to load announcements"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--a-text-primary)]">Announcements</h1>
        <p className="mt-1 text-[13.5px] text-[var(--a-text-muted)]">Messages from the admin team.</p>
      </div>

      {!loading && announcements.length === 0 ? (
        <Card><EmptyState icon={Megaphone} title="No announcements" description="You're all caught up." /></Card>
      ) : (
        <div className="flex flex-col gap-3">
          {announcements.map((a) => (
            <Card key={a.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[15px] font-semibold text-[var(--a-text-primary)]">{a.title}</h3>
                    <StatusBadge status={a.type} />
                    {a.priority === "urgent" && <StatusBadge status="urgent" />}
                  </div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--a-text-muted)]" dangerouslySetInnerHTML={{ __html: a.body }} />
                </div>
                <span className="shrink-0 text-[12px] text-[var(--a-text-faint)]">{new Date(a.sent_at).toLocaleDateString()}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
