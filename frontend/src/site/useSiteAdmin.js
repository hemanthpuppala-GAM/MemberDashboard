import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getToken } from "../lib/api";

const KEY = "gaw:site-edit-mode";

function storage(fn) {
  try {
    return fn(sessionStorage);
  } catch {
    return null; // private mode / storage blocked
  }
}

/**
 * "Edit this page" shortcut on the public pages. Shown only in edit mode — a page opened from
 * Admin → Site content ("View page" adds ?edit=1) — and only with an admin session, so a
 * signed-in admin browsing the site normally sees exactly what visitors see. Edit mode lasts
 * for the browser tab; the shortcut's × turns it off. The API re-checks permissions anyway.
 */
export function useSiteEditMode() {
  const { search } = useLocation();
  const [dismissed, setDismissed] = useState(false);
  const fromUrl = new URLSearchParams(search).get("edit") === "1";

  useEffect(() => {
    if (fromUrl) storage((s) => s.setItem(KEY, "1"));
  }, [fromUrl]);

  const exit = () => {
    storage((s) => s.removeItem(KEY));
    setDismissed(true);
  };

  const editMode = fromUrl || storage((s) => s.getItem(KEY)) === "1";
  const hasAdmin = !!storage(() => getToken());
  return { show: editMode && hasAdmin && !dismissed, exit };
}
