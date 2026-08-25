import { useEffect, useMemo, useState } from "react";
import { PenLine, Eye, Pencil, Trash2, Download, Check, X } from "lucide-react";
import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";
import Modal from "../ui/Modal";
import MonthCalendar from "../ui/MonthCalendar";
import { toLocalDateKey } from "../dateKey";
import Button from "../../components/ui/Button";
import { useMemberAuth } from "../../auth/MemberAuthContext";
import { memberAuthApi } from "../../lib/memberAuth";
import { exportJournalAsPdf } from "../journalExport";
import logoMark from "../../assets/logo-golden-age.jpg";

function formatDay(dateKey) {
  // Parse as local, not UTC, so it matches the calendar cell the user clicked.
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export default function JournalPage() {
  const { user } = useMemberAuth();
  const [entries, setEntries] = useState(null);
  const [loadError, setLoadError] = useState("");

  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [month, setMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => toLocalDateKey(new Date()));

  const [viewEntry, setViewEntry] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState("");
  const [rowError, setRowError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  useEffect(() => {
    memberAuthApi
      .journal()
      .then((data) => {
        setEntries(data);
        if (data.length > 0) {
          const latest = new Date(data[0].created_at);
          setSelectedDate(toLocalDateKey(latest));
          setMonth(latest);
        }
      })
      .catch((e) => setLoadError(e.message || "Could not load your journal."));
  }, []);

  const entriesByDate = useMemo(() => {
    const map = new Map();
    for (const entry of entries ?? []) {
      const key = toLocalDateKey(new Date(entry.created_at));
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(entry);
    }
    return map;
  }, [entries]);

  const markedDates = useMemo(() => new Set(entriesByDate.keys()), [entriesByDate]);
  const dayEntries = (selectedDate && entriesByDate.get(selectedDate)) || [];

  const save = async () => {
    if (!draft.trim()) return;
    setSaving(true);
    setSaveError("");
    try {
      const entry = await memberAuthApi.addJournalEntry(draft.trim());
      setEntries((prev) => [entry, ...(prev ?? [])]);
      setDraft("");
      const key = toLocalDateKey(new Date(entry.created_at));
      setSelectedDate(key);
      setMonth(new Date(entry.created_at));
    } catch (e) {
      setSaveError(e.message || "Could not save your entry.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (entry) => {
    setViewEntry(null);
    setRowError("");
    setEditingId(entry.id);
    setEditDraft(entry.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setRowError("");
  };

  const saveEdit = async (id) => {
    if (!editDraft.trim()) return;
    setRowError("");
    try {
      const updated = await memberAuthApi.updateJournalEntry(id, editDraft.trim());
      setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)));
      setEditingId(null);
    } catch (e) {
      setRowError(e.message || "Could not save changes.");
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await memberAuthApi.deleteJournalEntry(deleteTarget.id);
      setEntries((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      setRowError(e.message || "Could not delete entry.");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setExportError("");
    try {
      await exportJournalAsPdf({ memberName: user?.name || "Member", entries: entries ?? [], logoUrl: logoMark });
    } catch (e) {
      setExportError(e.message || "Could not generate the PDF.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-[22px] text-[var(--color-ink)]">Journal</h2>
          <p className="mt-1 text-[14px] text-[var(--color-muted)]">Reflect on today's sit.</p>
        </div>
        <Button as="button" variant="secondary" onClick={handleExport} disabled={exporting || !entries?.length}>
          <Download size={15} />
          {exporting ? "Preparing…" : "Download as ebook"}
        </Button>
      </div>

      {exportError && <p className="rounded-xl border border-red-400/30 bg-red-50 px-4 py-3 text-[13.5px] text-red-700">{exportError}</p>}

      <Card accent title="New entry">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={4}
          placeholder="What came up during your sit today?"
          className="w-full rounded-xl border border-[rgba(110,198,234,0.35)] bg-white/70 p-3 text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-muted-soft)] transition-colors focus:border-[var(--color-blue)] focus:shadow-[0_0_0_3px_rgba(110,198,234,0.18)] focus:outline-none"
        />
        {saveError && <p className="mt-2 text-[13px] text-red-600">{saveError}</p>}
        <div className="mt-3 flex justify-end">
          <Button as="button" onClick={save} disabled={!draft.trim() || saving}>
            <PenLine size={15} />
            {saving ? "Saving…" : "Save entry"}
          </Button>
        </div>
      </Card>

      {loadError && <p className="rounded-xl border border-red-400/30 bg-red-50 px-4 py-3 text-[13.5px] text-red-700">{loadError}</p>}

      {entries?.length === 0 && (
        <Card padded={false}>
          <EmptyState icon={PenLine} title="No entries yet" description="Your reflections after each sit will show up here." />
        </Card>
      )}

      {entries && entries.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-[260px_1fr]">
          <Card>
            <MonthCalendar
              month={month}
              onMonthChange={setMonth}
              markedDates={markedDates}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </Card>

          <Card
            title={selectedDate ? formatDay(selectedDate) : "Select a day"}
            description={dayEntries.length > 0 ? `${dayEntries.length} ${dayEntries.length === 1 ? "entry" : "entries"}` : undefined}
          >
            {rowError && <p className="mb-3 text-[13px] text-red-600">{rowError}</p>}
            {dayEntries.length === 0 ? (
              <p className="text-[13.5px] text-[var(--color-muted)]">No entries for this day.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {dayEntries.map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-[rgba(110,198,234,0.25)] bg-white/60 p-3.5">
                    {editingId === entry.id ? (
                      <div className="flex flex-col gap-2.5">
                        <textarea
                          autoFocus
                          value={editDraft}
                          onChange={(e) => setEditDraft(e.target.value)}
                          rows={3}
                          className="w-full rounded-xl border border-[rgba(110,198,234,0.35)] bg-white/80 p-2.5 text-[13.5px] text-[var(--color-ink)] focus:border-[var(--color-blue)] focus:outline-none"
                        />
                        <div className="flex justify-end gap-2">
                          <Button as="button" variant="secondary" onClick={cancelEdit}>
                            <X size={14} />
                            Cancel
                          </Button>
                          <Button as="button" onClick={() => saveEdit(entry.id)} disabled={!editDraft.trim()}>
                            <Check size={14} />
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[12px] font-medium tracking-wide text-[var(--color-muted)]">{formatTime(entry.created_at)}</span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-[13.5px] text-[var(--color-ink)]">{entry.content}</p>
                        <div className="mt-2.5 flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewEntry(entry)}
                            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium text-[var(--color-blue-dark)] transition-colors hover:bg-[rgba(110,198,234,0.15)]"
                          >
                            <Eye size={13} />
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => startEdit(entry)}
                            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium text-[var(--color-blue-dark)] transition-colors hover:bg-[rgba(110,198,234,0.15)]"
                          >
                            <Pencil size={13} />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(entry)}
                            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium text-red-600 transition-colors hover:bg-red-50"
                          >
                            <Trash2 size={13} />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      <Modal
        open={!!viewEntry}
        onClose={() => setViewEntry(null)}
        title={viewEntry ? formatDay(toLocalDateKey(new Date(viewEntry.created_at))) : ""}
        description={viewEntry ? `Saved at ${formatTime(viewEntry.created_at)}` : ""}
      >
        <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-[var(--color-ink)]">{viewEntry?.content}</p>
        {viewEntry && (
          <div className="mt-4 flex justify-end gap-2">
            <Button as="button" variant="secondary" onClick={() => startEdit(viewEntry)}>
              <Pencil size={14} />
              Edit
            </Button>
          </div>
        )}
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete this entry?"
        description="This can't be undone."
      >
        <div className="flex justify-end gap-2">
          <Button as="button" variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>
            Cancel
          </Button>
          <button
            type="button"
            onClick={confirmDelete}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-red-600 px-5 py-2 font-body text-[14px] font-semibold tracking-wide text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            <Trash2 size={14} />
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
