/** Data hooks for the support desk: dashboard, ticket list, one ticket, auto-refresh. */
import { useCallback, useEffect, useRef, useState } from "react";
import { supportApi } from "./supportApi";

const PER_PAGE = 25;

/** Calls `fn` every `ms` and whenever the window regains focus / becomes visible. */
export function useAutoRefresh(fn, ms = 60_000) {
  const ref = useRef(fn);
  useEffect(() => {
    ref.current = fn;
  }, [fn]);

  useEffect(() => {
    const run = () => {
      if (document.visibilityState !== "hidden") ref.current();
    };
    const id = setInterval(run, ms);
    window.addEventListener("focus", run);
    document.addEventListener("visibilitychange", run);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", run);
      document.removeEventListener("visibilitychange", run);
    };
  }, [ms]);
}

/** GET /support/dashboard + /support/agents. */
export function useDashboard() {
  const [data, setData] = useState(null);
  const [agents, setAgents] = useState([]);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const [d, a] = await Promise.all([supportApi.dashboard(), supportApi.agents()]);
      setData(d);
      setAgents(Array.isArray(a) ? a : []);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch
    refresh();
  }, [refresh]);

  return { data, agents, error, refresh };
}

/**
 * Paged ticket list for a scope + filters. `refresh` re-reads every loaded page so
 * "load more" results stay in place during auto-refresh.
 */
export function useTicketList({ scope, q, source }) {
  const [state, setState] = useState({ items: [], page: 0, lastPage: 1, total: 0, loading: true, error: "" });
  const reqId = useRef(0);
  const pagesRef = useRef(1);

  const load = useCallback(
    async (pages, { quiet = false } = {}) => {
      const id = ++reqId.current;
      if (!quiet) setState((s) => ({ ...s, loading: true, error: "" }));
      try {
        const results = await Promise.all(
          Array.from({ length: pages }, (_, i) => supportApi.tickets({ scope, q, source, page: i + 1, per_page: PER_PAGE })),
        );
        if (id !== reqId.current) return;
        const last = results[results.length - 1]?.meta ?? {};
        const seen = new Set();
        const items = results.flatMap((r) => r.data ?? []).filter((t) => !seen.has(t.id) && seen.add(t.id));
        pagesRef.current = pages;
        setState({ items, page: pages, lastPage: last.last_page ?? 1, total: last.total ?? items.length, loading: false, error: "" });
      } catch (err) {
        if (id !== reqId.current) return;
        setState((s) => ({ ...s, loading: false, error: err.message }));
      }
    },
    [scope, q, source],
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const refresh = useCallback(() => load(pagesRef.current, { quiet: true }), [load]);

  const [loadingMore, setLoadingMore] = useState(false);
  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    const next = pagesRef.current + 1;
    try {
      const res = await supportApi.tickets({ scope, q, source, page: next, per_page: PER_PAGE });
      pagesRef.current = next;
      setState((s) => {
        const ids = new Set(s.items.map((t) => t.id));
        return {
          ...s,
          items: [...s.items, ...(res.data ?? []).filter((t) => !ids.has(t.id))],
          page: next,
          lastPage: res.meta?.last_page ?? s.lastPage,
          total: res.meta?.total ?? s.total,
        };
      });
    } catch (err) {
      setState((s) => ({ ...s, error: err.message }));
    } finally {
      setLoadingMore(false);
    }
  }, [scope, q, source]);

  return { ...state, hasMore: state.page < state.lastPage, loadingMore, loadMore, refresh, reload: () => load(1) };
}

/** One ticket with comments + earlier history. */
export function useTicket(id) {
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!id) return;
    try {
      const t = await supportApi.ticket(id);
      setTicket(t);
      setError("");
    } catch (err) {
      setError(err.status === 404 ? "This ticket doesn't exist (or was removed)." : err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- reset + fetch when the ticket changes */
    setTicket(null);
    setLoading(true);
    reload();
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [reload]);

  return { ticket, error, loading, reload, setTicket };
}
