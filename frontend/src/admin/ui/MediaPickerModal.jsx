import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Modal from "./Modal";
import { PillTabs } from "./Tabs";
import { api } from "../../lib/api";
import { MEDIA_FOLDERS } from "../mock/mockData";

const TITLES = { image: "Choose an image", video: "Choose a video", all: "Choose media" };

/**
 * Modal grid picker over the Media Library — click an item to select its URL.
 * Opens pre-filtered to the page's own folder when one matches. `accept`
 * narrows which mime family is shown/selectable: "image" (default, matches
 * every pre-existing caller), "video", or "all".
 */
export default function MediaPickerModal({ open, onClose, onSelect, initialFolder = "All", accept = "image" }) {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [folder, setFolder] = useState(initialFolder);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the picker each time it's reopened for a different field
    setLoading(true);
    setFolder(initialFolder);
    api
      .media()
      .then(setMedia)
      .catch((err) => toast.error(err.message ?? "Failed to load media"))
      .finally(() => setLoading(false));
  }, [open, initialFolder]);

  const items = (folder === "All" ? media : media.filter((m) => m.folder === folder)).filter((m) => {
    const isVideo = m.mime_type?.startsWith("video");
    return accept === "all" || (accept === "video" ? isVideo : !isVideo);
  });
  const emptyLabel = accept === "video" ? "videos" : accept === "all" ? "files" : "images";

  return (
    <Modal open={open} onClose={onClose} title={TITLES[accept]} description="Pulled from the Media Library — upload new files there first." size="lg">
      <div className="flex flex-col gap-4">
        <PillTabs tabs={MEDIA_FOLDERS.map((f) => ({ key: f, label: f }))} active={folder} onChange={setFolder} />
        {loading ? (
          <p className="py-10 text-center text-[13px] text-[var(--a-text-muted)]">Loading…</p>
        ) : items.length === 0 ? (
          <p className="py-10 text-center text-[13px] text-[var(--a-text-muted)]">
            No {emptyLabel} in this folder yet — upload one from the Media Library first.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {items.map((item) => {
              const isVideo = item.mime_type?.startsWith("video");
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelect(item.url);
                    onClose();
                  }}
                  className="group aspect-video overflow-hidden rounded-lg border border-[var(--a-border)] bg-[var(--a-bg-surface-2)] transition-colors hover:border-[var(--a-accent)]"
                  title={item.filename}
                >
                  {isVideo ? (
                    <video src={item.url} muted className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <img src={item.url} alt={item.alt_text ?? ""} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
