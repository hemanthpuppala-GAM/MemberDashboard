import { useEffect, useState } from "react";
import { api } from "../../lib/api";

/** Largest audio upload this server takes (PHP upload_max_filesize / post_max_size), in MB. */
export default function useUploadLimit() {
  const [maxMb, setMaxMb] = useState(null);
  useEffect(() => {
    api.musicLimits().then((r) => setMaxMb(r?.max_mb ?? null)).catch(() => {});
  }, []);
  return maxMb;
}
