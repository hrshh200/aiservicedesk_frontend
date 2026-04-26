import { useState, useCallback, useEffect } from "react";
import {
  MessageSquare,
  Ticket,
  LayoutDashboard,
  Menu,
  X,
  Cpu,
  ChevronRight,
} from "lucide-react";
import ChatPanel from "./components/ChatPanel";
import TicketList from "./components/TicketList";
import TicketDetail from "./components/TicketDetail";
import StatsBar from "./components/StatsBar";
import { Ticket as TicketType } from "./types";

type Tab = "chat" | "tickets";


const getSessionId = () => {
  let id = localStorage.getItem("session_id");
  if (!id) {
    id = `session_${crypto.randomUUID()}`;
    localStorage.setItem("session_id", id);
  }
  return id;
};

const SESSION_ID = getSessionId();

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const handleTicketCreated = useCallback(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
  if (!selectedTicket) return;

  fetch(`http://localhost:3000/api/tickets`)
    .then(res => res.json())
    .then((data: TicketType[]) => {
      const updated = data.find(t => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    });
}, [refreshKey]);

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Top Nav */}
      <header className="flex-shrink-0 bg-white border-b border-gray-100 shadow-sm z-20">
        <div className="flex items-center h-14 px-4 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Cpu size={16} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-none">
                ServiceDesk AI
              </p>
              <p className="text-[10px] text-gray-400 leading-none mt-0.5">
                ITSM POC
              </p>
            </div>
          </div>

          {/* POC Badges */}
          <div className="hidden md:flex items-center gap-1.5 flex-1 overflow-hidden">
            {[
              "POC 1: Intent Detection",
              "POC 2: Guided Ticket Creation",
              "POC 3: AI Triage & Routing",
            ].map((poc, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 border border-gray-200 rounded-md px-2 py-0.5 font-medium flex-shrink-0"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                {poc}
              </span>
            ))}
          </div>

          {/* Nav tabs */}
          <nav className="hidden md:flex items-center gap-1 ml-auto">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === "chat"
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <MessageSquare size={15} />
              Chat
            </button>
            <button
              onClick={() => setActiveTab("tickets")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === "tickets"
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Ticket size={15} />
              Tickets
            </button>
          </nav>

          {/* Mobile menu toggle */}
          <button
            className="ml-auto md:hidden p-1.5 hover:bg-gray-100 rounded-md"
            onClick={() => setMobileMenuOpen((o) => !o)}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-2 flex gap-2">
            <button
              onClick={() => {
                setActiveTab("chat");
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === "chat"
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-500"
              }`}
            >
              <MessageSquare size={15} /> Chat
            </button>
            <button
              onClick={() => {
                setActiveTab("tickets");
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === "tickets"
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-500"
              }`}
            >
              <Ticket size={15} /> Tickets
            </button>
          </div>
        )}
      </header>

      {/* Stats Bar */}
      <StatsBar refreshKey={refreshKey} />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex">
        {/* Chat Tab */}
        {activeTab === "chat" && (
          <div className="flex flex-1 overflow-hidden">
            {/* Chat column */}
            <div
              className="flex-1 flex flex-col overflow-hidden border-r border-gray-100"
              style={{ maxWidth: "520px" }}
            >
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                <MessageSquare size={13} className="text-blue-600" />
                <span className="text-xs font-semibold text-gray-600">
                  Chat Interface
                </span>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-400 font-mono truncate">
                  {SESSION_ID}
                </span>
              </div>
              <div className="flex-1 overflow-hidden relative">
                <ChatPanel
                  sessionId={SESSION_ID}
                  onTicketCreated={handleTicketCreated}
                />
              </div>
            </div>

            {/* Right panel: ticket detail or queue */}
            <div className="hidden lg:flex flex-col flex-1 overflow-hidden bg-white">
              {selectedTicket ? (
                <TicketDetail
                  ticket={selectedTicket}
                  onClose={() => setSelectedTicket(null)}
                  onUpdated={() => {
                    refresh();
                  }}
                />
              ) : (
                <>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                    <LayoutDashboard size={13} className="text-gray-500" />
                    <span className="text-xs font-semibold text-gray-600">
                      Ticket Queue
                    </span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <TicketList
                      onSelectTicket={setSelectedTicket}
                      selectedId={null}
                      refreshKey={refreshKey}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Tickets Tab */}
        {activeTab === "tickets" && (
          <div className="flex flex-1 overflow-hidden">
            {/* Ticket list */}
            <div className="w-80 flex-shrink-0 border-r border-gray-100 overflow-hidden flex flex-col">
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                <Ticket size={13} className="text-blue-600" />
                <span className="text-xs font-semibold text-gray-600">
                  Ticket Queue
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                <TicketList
                  onSelectTicket={setSelectedTicket}
                  selectedId={selectedTicket?.id ?? null}
                  refreshKey={refreshKey}
                />
              </div>
            </div>

            {/* Ticket detail */}
            <div className="flex-1 overflow-hidden">
              {selectedTicket ? (
                <TicketDetail
                  ticket={selectedTicket}
                  onClose={() => setSelectedTicket(null)}
                  onUpdated={() => {
                    refresh();
                    setSelectedTicket(null);
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center px-8 gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <Ticket size={28} className="text-gray-300" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">
                      No ticket selected
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Select a ticket from the list to view its details
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                    <MessageSquare size={12} />
                    <span>Use the Chat tab to create new tickets via AI</span>
                    <ChevronRight size={12} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
