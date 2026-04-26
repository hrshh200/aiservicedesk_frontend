import { useEffect, useState } from "react";
import TeamDropdown from "./TeamDropdown";

import {
  AlertCircle,
  ClipboardList,
  Activity,
  CheckCircle2,
  Users,
  Server,
  Code2,
  Database,
} from "lucide-react";

interface Stats {
  total: number;
  incidents: number;
  requests: number;
  open: number;
  inProgress: number;
  resolved: number;
  critical: number;
}

export default function StatsBar({ refreshKey }: { refreshKey: number }) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    incidents: 0,
    requests: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    critical: 0,
  });

  const [frontendTeam, setFrontendTeam] = useState<any[]>([]);
  const [backendTeam, setBackendTeam] = useState<any[]>([]);
  const [devopsTeam, setDevopsTeam] = useState<any[]>([]);

  const [selectedFrontend, setSelectedFrontend] = useState("");
  const [selectedBackend, setSelectedBackend] = useState("");
  const [selectedDevops, setSelectedDevops] = useState("");

  useEffect(() => {
    async function load() {
      try {
        // stats
        const res = await fetch("http://localhost:3000/api/stats");
        const data = await res.json();

        setStats({
          total: data.total ?? 0,
          incidents: data.incidents ?? 0,
          requests: data.requests ?? 0,
          open: data.open ?? 0,
          inProgress: data.inProgress ?? 0,
          resolved: data.resolved ?? 0,
          critical: data.critical ?? 0,
        });

        // 🔥 teams
        const teamRes = await fetch("http://localhost:3000/api/teams");
        const teamData = await teamRes.json();

        setFrontendTeam(teamData.frontend || []);
        setBackendTeam(teamData.backend || []);
        setDevopsTeam(teamData.devops || []);
      } catch (err) {
        console.error("Failed to load data", err);
      }
    }

    load();
  }, [refreshKey]);

  const cards = [
    {
      label: "Total",
      value: stats.total,
      icon: <Activity size={18} />,
      color: "bg-gray-50 text-gray-800",
    },
    {
      label: "Incidents",
      value: stats.incidents,
      icon: <AlertCircle size={18} />,
      color: "bg-red-50 text-red-700",
    },
    {
      label: "Requests",
      value: stats.requests,
      icon: <ClipboardList size={18} />,
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "Open",
      value: stats.open,
      icon: <Activity size={18} />,
      color: "bg-amber-50 text-amber-700",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: <Activity size={18} />,
      color: "bg-orange-50 text-orange-700",
    },
    {
      label: "Resolved",
      value: stats.resolved,
      icon: <CheckCircle2 size={18} />,
      color: "bg-green-50 text-green-700",
    },
    {
      label: "Critical",
      value: stats.critical,
      icon: <AlertCircle size={18} />,
      color: "bg-red-100 text-red-800",
    },
  ];

  return (
    <div className="w-full bg-white border-b px-6 py-4 shadow-sm">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Activity size={16} /> Service Desk Dashboard
        </h2>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Users size={14} /> Teams
        </div>
      </div>

      {/* STATS */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`min-w-[130px] rounded-xl border px-4 py-3 shadow-sm hover:shadow-md transition ${card.color}`}
          >
            <div className="flex items-center justify-between mb-1">
              {card.icon}
              <span className="text-[10px] uppercase tracking-wide opacity-70">
                {card.label}
              </span>
            </div>

            <p className="text-xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* TEAM DROPDOWNS (UPDATED) */}
      <div className="flex items-center gap-4 mt-4 flex-wrap">
        {/* Frontend */}
        <div className="flex flex-col">
          <label className="text-[10px] text-gray-500 mb-1 flex items-center gap-1">
            <Code2 size={12} /> Frontend
          </label>
          <TeamDropdown
            label="Select Frontend"
            members={frontendTeam.map((m) => ({
              name: m.name,
              tickets: m.current_load,
            }))}
            selected={selectedFrontend}
            isOpen={openDropdown === "frontend"}
            onToggle={() =>
              setOpenDropdown(openDropdown === "frontend" ? null : "frontend")
            }
            onSelect={(name) => {
              setSelectedFrontend(name);
              setOpenDropdown(null);
            }}
          />
        </div>

        {/* Backend */}
        <div className="flex flex-col">
          <label className="text-[10px] text-gray-500 mb-1 flex items-center gap-1">
            <Database size={12} /> Backend
          </label>
          <TeamDropdown
            label="Select Backend"
            members={backendTeam.map((m) => ({
              name: m.name,
              tickets: m.current_load,
            }))}
            selected={selectedBackend}
            isOpen={openDropdown === "backend"}
            onToggle={() =>
              setOpenDropdown(openDropdown === "backend" ? null : "backend")
            }
            onSelect={(name) => {
              setSelectedBackend(name);
              setOpenDropdown(null);
            }}
          />
        </div>

        {/* DevOps */}
        <div className="flex flex-col">
          <label className="text-[10px] text-gray-500 mb-1 flex items-center gap-1">
            <Server size={12} /> DevOps / Infra
          </label>
          <TeamDropdown
            label="Select DevOps"
            members={devopsTeam.map((m) => ({
              name: m.name,
              tickets: m.current_load,
            }))}
            selected={selectedDevops}
            isOpen={openDropdown === "devops"}
            onToggle={() =>
              setOpenDropdown(openDropdown === "devops" ? null : "devops")
            }
            onSelect={(name) => {
              setSelectedDevops(name);
              setOpenDropdown(null);
            }}
          />
        </div>
      </div>
    </div>
  );
}
