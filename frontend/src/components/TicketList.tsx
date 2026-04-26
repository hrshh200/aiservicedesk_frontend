import { useEffect, useState, useCallback } from "react";
import {
  AlertCircle,
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Ticket, Priority, Status } from "../types";

interface TicketListProps {
  onSelectTicket: (ticket: Ticket) => void;
  selectedId: string | null;
  refreshKey: number;
}

const priorityConfig: Record<
  Priority,
  { color: string; bg: string; dot: string }
> = {
  Critical: {
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    dot: "bg-red-500",
  },
  High: {
    color: "text-orange-700",
    bg: "bg-orange-50 border-orange-200",
    dot: "bg-orange-500",
  },
  Medium: {
    color: "text-yellow-700",
    bg: "bg-yellow-50 border-yellow-200",
    dot: "bg-yellow-500",
  },
  Low: {
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
    dot: "bg-green-500",
  },
};

const statusConfig: Record<Status, { icon: React.ReactNode; color: string }> = {
  Open: { icon: <Clock size={12} />, color: "text-blue-600 bg-blue-50" },
  "In Progress": {
    icon: <RefreshCw size={12} />,
    color: "text-amber-600 bg-amber-50",
  },
  Pending: { icon: <Clock size={12} />, color: "text-gray-600 bg-gray-100" },
  Resolved: {
    icon: <CheckCircle2 size={12} />,
    color: "text-green-600 bg-green-50",
  },
  Closed: { icon: <XCircle size={12} />, color: "text-gray-500 bg-gray-100" },
};

export default function TicketList({
  onSelectTicket,
  selectedId,
  refreshKey,
}: TicketListProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<
    "all" | "incident" | "service_request"
  >("all");
  const [filterStatus, setFilterStatus] = useState<"all" | Status>("all");

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();

      if (filterType !== "all") params.append("type", filterType);
      if (filterStatus !== "all") params.append("status", filterStatus);

      const res = await fetch(
        `http://localhost:3000/api/tickets?${params.toString()}`,
      );
      const data = await res.json();

      setTickets(data ?? []);
    } catch (err) {
      console.error("Failed to fetch tickets", err);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterStatus]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
            <Filter size={14} className="text-gray-500" />
            All Tickets
            <span className="ml-1 text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 font-medium">
              {tickets.length}
            </span>
          </h2>
          <button
            onClick={load}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <RefreshCw
              size={14}
              className={`text-gray-400 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {/* Filters */}
        <div className="space-y-1.5">
          <div className="flex gap-1">
            {(["all", "incident", "service_request"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`flex-1 text-xs py-1 px-2 rounded-md font-medium transition-colors ${
                  filterType === t
                    ? t === "incident"
                      ? "bg-red-100 text-red-700"
                      : t === "service_request"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {t === "all"
                  ? "All"
                  : t === "incident"
                    ? "Incidents"
                    : "Requests"}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {(["all", "Open", "In Progress", "Resolved"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`flex-1 text-xs py-1 px-1.5 rounded-md font-medium transition-colors truncate ${
                  filterStatus === s
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {s === "all" ? "All" : s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <RefreshCw size={20} className="text-gray-300 animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center px-4">
            <ClipboardList size={28} className="text-gray-200 mb-2" />
            <p className="text-sm text-gray-400">No tickets yet</p>
            <p className="text-xs text-gray-300 mt-1">
              Submit a request via the chat
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {tickets.map((ticket) => {
              const pri = priorityConfig[ticket.priority];
              const st = statusConfig[ticket.status];
              const isSelected = ticket.id === selectedId;

              return (
                <button
                  key={ticket.id}
                  onClick={() => onSelectTicket(ticket)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3 ${
                    isSelected ? "bg-blue-50 border-l-2 border-l-blue-500" : ""
                  }`}
                >
                  <div
                    className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      ticket.type === "incident" ? "bg-red-100" : "bg-blue-100"
                    }`}
                  >
                    {ticket.type === "incident" ? (
                      <AlertCircle size={12} className="text-red-600" />
                    ) : (
                      <ClipboardList size={12} className="text-blue-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <p className="text-xs font-semibold text-gray-900 truncate leading-tight">
                        {ticket.title || "Untitled"}
                      </p>
                      <ChevronRight
                        size={12}
                        className="text-gray-300 flex-shrink-0 mt-0.5"
                      />
                    </div>

                    <p className="text-xs text-gray-500 truncate mb-1.5">
                      {ticket.category}
                    </p>

                    <p className="text-[11px] text-gray-600 mt-1">
                      👤 {ticket.agents?.name || "Unassigned"}
                    </p>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded border ${pri.bg} ${pri.color}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${pri.dot}`}
                        />
                        {ticket.priority}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded ${st.color}`}
                      >
                        {st.icon}
                        {ticket.status}
                      </span>
                    </div>

                    <p className="text-[10px] text-gray-400 mt-1.5">
                      {new Date(ticket.created_at).toLocaleDateString()} ·{" "}
                      {new Date(ticket.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
