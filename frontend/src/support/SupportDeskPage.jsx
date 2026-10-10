import { useCallback, useEffect, useState } from "react";
import { useMatch, useNavigate } from "react-router-dom";
import { PhoneCall } from "lucide-react";
import { SupportAuthProvider, useSupportAuth } from "./SupportAuthContext";
import SupportLoginPage from "./SupportLoginPage";
import DeskHeader from "./components/DeskHeader";
import KpiTiles from "./components/KpiTiles";
import LogCallDialog from "./components/LogCallDialog";
import TeamPanel from "./components/TeamPanel";
import TicketDetail from "./components/TicketDetail";
import { TicketFilters, TicketList } from "./components/TicketList";
import { Button, ErrorNote, Loading, Segmented } from "./components/ui";
import { useAutoRefresh, useDashboard, useTicketList } from "./useDeskData";
import "./desk.css";

/** /support and /support/ticket/:id — the staff support desk (login screen when signed out). */
export default function SupportDeskPage() {
  return (
    <SupportAuthProvider>
      <div className="gaw-desk">
        <DeskGate />
      </div>
    </SupportAuthProvider>
  );
}

function DeskGate() {
  const { status } = useSupportAuth();
  if (status === "checking") return <Loading label="Checking your sign-in…" className="min-h-dvh" />;
  if (status !== "in") return <SupportLoginPage />;
  return <Desk />;
}

const VIEWS = [
  { value: "tickets", label: "Tickets" },
  { value: "team", label: "Team & reviews" },
];

function useDebounced(value, ms) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

function Desk() {
  const { agent, logout, tokenKind } = useSupportAuth();
  const navigate = useNavigate();
  const match = useMatch("/support/ticket/:id");
  const selectedId = match?.params.id ?? null;

  const [view, setView] = useState("tickets");
  const [scope, setScope] = useState("open");
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("");
  const [logging, setLogging] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const q = useDebounced(search.trim(), 350);

  const dash = useDashboard();
  const list = useTicketList({ scope, q, source });
  const { refresh: refreshDash } = dash;
  const { refresh: refreshList } = list;
  const refreshAll = useCallback(() => {
    refreshDash();
    refreshList();
  }, [refreshDash, refreshList]);
  useAutoRefresh(refreshAll, 60_000);

  const close = useCallback(() => navigate("/support"), [navigate]);
  const closeLogCall = useCallback(() => setLogging(false), []);
  useDetailPanelBehaviour(selectedId, close);

  const onCreated = (ticket) => {
    setLogging(false);
    refreshAll();
    setView("tickets");
    navigate(`/support/ticket/${ticket.id}`);
  };

  const me = dash.data?.me ?? agent;

  return (
    <>
      <DeskHeader
        agent={agent}
        viaAdmin={tokenKind === "admin"}
        onLogCall={() => setLogging(true)}
        loggingOut={loggingOut}
        onLogout={async () => {
          setLoggingOut(true);
          await logout();
        }}
      />
      <main className="mx-auto flex w-full max-w-[1320px] flex-col gap-5 px-4 pb-28 pt-4 sm:px-6 sm:pb-12 sm:pt-6">
        {dash.error && !dash.data && <ErrorNote onRetry={refreshDash}>Couldn't load the desk numbers. {dash.error}</ErrorNote>}
        <KpiTiles stats={dash.data?.stats} />

        <div className="self-start">
          <Segmented label="Show" value={view} options={VIEWS} onChange={setView} />
        </div>

        {view === "team" ? (
          <TeamPanel team={dash.data?.team} reviews={dash.data?.latest_reviews} meId={me?.id} />
        ) : (
          <div className={`grid items-start gap-5 ${selectedId ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]" : ""}`}>
            <section aria-label="Tickets" className="flex min-w-0 flex-col gap-4">
              <TicketFilters
                scope={scope}
                onScope={setScope}
                search={search}
                onSearch={setSearch}
                source={source}
                onSource={setSource}
                stats={dash.data?.stats}
              />
              <TicketList list={list} scope={scope} filtered={!!(q || source)} selectedId={selectedId} />
            </section>

            {selectedId && (
              <aside
                aria-label="Ticket"
                className="fixed inset-0 z-40 overflow-y-auto bg-[#F3EAD3] lg:sticky lg:inset-auto lg:top-[84px] lg:z-auto lg:max-h-[calc(100dvh-100px)] lg:rounded-2xl lg:border lg:border-[rgba(138,111,52,0.18)] lg:bg-[#F7F0DE]"
              >
                <TicketDetail key={selectedId} id={selectedId} me={me} agents={dash.agents} onClose={close} onChanged={refreshAll} />
              </aside>
            )}
          </div>
        )}
      </main>

      {/* Phone: keep "Log a call" one thumb away. */}
      {!selectedId && (
        <div className="fixed bottom-[calc(16px+env(safe-area-inset-bottom))] right-4 z-30 sm:hidden">
          <Button variant="primary" onClick={() => setLogging(true)} className="min-h-[52px] px-5 shadow-[0_8px_24px_rgba(20,36,28,0.3)]">
            <PhoneCall size={18} aria-hidden /> Log a call
          </Button>
        </div>
      )}
      {logging && <LogCallDialog onClose={closeLogCall} onCreated={onCreated} />}
    </>
  );
}

/** Escape closes the ticket; on phones the full-screen ticket locks the page behind it. */
function useDetailPanelBehaviour(selectedId, close) {
  useEffect(() => {
    if (!selectedId) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape" && !document.querySelector("[role=dialog]")) close();
    };
    document.addEventListener("keydown", onKey);
    const phone = window.matchMedia("(max-width: 1023px)").matches;
    const prev = document.body.style.overflow;
    if (phone) document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [selectedId, close]);
}
