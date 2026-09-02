import { useEffect, useState } from "react";
import { publicApi } from "../lib/api";

/** Admin-created pages beyond the built-in set, for the nav/footer to list. */
export function useCustomPages() {
  const [pages, setPages] = useState([]);
  useEffect(() => {
    publicApi.pages().then(setPages).catch(() => {});
  }, []);
  return pages;
}
