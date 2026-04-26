import { useState } from 'react';
import { X, AlertCircle, ClipboardList, Clock, Tag, Users, Activity, Zap, ChevronDown } from 'lucide-react';
import { Ticket, Status, Priority } from '../types';

interface TicketDetailProps {
  ticket: Ticket;
  onClose: () => void;
  onUpdated: () => void;
}

const priorityColors: Record<Priority, string> = {
  Critical: 'text-red-700 bg-red-50 border-red-200',
  High: 'text-orange-700 bg-orange-50 border-orange-200',
  Medium: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  Low: 'text-green-700 bg-green-50 border-green-200',
};

const statusColors: Record<Status, string> = {
  'Open': 'text-blue-700 bg-blue-50 border-blue-200',
  'In Progress': 'text-amber-700 bg-amber-50 border-amber-200',
  'Pending': 'text-gray-600 bg-gray-100 border-gray-200',
  'Resolved': 'text-green-700 bg-green-50 border-green-200',
  'Closed': 'text-gray-500 bg-gray-100 border-gray-200',
};

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-sm text-gray-900 ${mono ? 'font-mono text-xs' : ''}`}>{value || '—'}</p>
    </div>
  );
}

export default function TicketDetail({ ticket, onClose, onUpdated }: TicketDetailProps) {
  const [status, setStatus] = useState<Status>(ticket.status);
  const [priority, setPriority] = useState<Priority>(ticket.priority);
  const [saving, setSaving] = useState(false);

  async function save() {
  setSaving(true);

  try {
    const res = await fetch(`http://localhost:3000/api/tickets/${ticket.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
        priority,
      }),
    });

    if (!res.ok) throw new Error("Failed to update");

    onUpdated(); // refresh parent list

  } catch (err) {
    console.error("Update failed", err);
    alert("Failed to update ticket");
  } finally {
    setSaving(false);
  }
}

  const hasChanges = status !== ticket.status || priority !== ticket.priority;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-start gap-3 px-4 py-3 border-b border-gray-100 bg-white">
        <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${ticket.type === 'incident' ? 'bg-red-100' : 'bg-blue-100'
          }`}>
          {ticket.type === 'incident'
            ? <AlertCircle size={16} className="text-red-600" />
            : <ClipboardList size={16} className="text-blue-600" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              {ticket.type === 'incident' ? 'INC' : 'REQ'}-{ticket.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">{ticket.title}</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0">
          <X size={16} className="text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Status & Priority - Editable */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Actions</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Status</label>
              <div className="relative">
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as Status)}
                  className={`w-full appearance-none text-xs font-semibold border rounded-md px-2.5 py-1.5 pr-6 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-200 ${statusColors[status]}`}
                >
                  {(['Open', 'In Progress', 'Pending', 'Resolved', 'Closed'] as Status[]).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Priority</label>
              <div className="relative">
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as Priority)}
                  className={`w-full appearance-none text-xs font-semibold border rounded-md px-2.5 py-1.5 pr-6 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-200 ${priorityColors[priority]}`}
                >
                  {(['Critical', 'High', 'Medium', 'Low'] as Priority[]).map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
              </div>
            </div>
          </div>

          {hasChanges && (
            <button
              onClick={save}
              disabled={saving}
              className="mt-2 w-full text-xs font-semibold bg-blue-600 text-white rounded-md py-1.5 hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>

        {/* Description */}
        <div className="px-4 py-3 border-b border-gray-50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
            <Activity size={11} /> Description
          </p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{ticket.description || '—'}</p>
        </div>

        {/* Categorization */}
        <div className="px-4 py-3 border-b border-gray-50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
            <Tag size={11} /> Categorization
          </p>
          <div className="space-y-2">
            <Field label="Category" value={ticket.category} />
            <Field label="Subcategory" value={ticket.subcategory} />
          </div>
        </div>

        {/* Triage Details */}
        <div className="px-4 py-3 border-b border-gray-50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
            <Zap size={11} /> Triage & Routing
          </p>
          <div className="space-y-2">
            <Field label="Assigned Team" value={ticket.assigned_team} />
            <div className="grid grid-cols-2 gap-2">
              <Field label="Impact" value={ticket.impact} />
              <Field label="Urgency" value={ticket.urgency} />
            </div>
          </div>
        </div>

        {/* Caller & Metadata */}
        <div className="px-4 py-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
            <Users size={11} /> Metadata
          </p>
          <div className="space-y-2">
            <Field label="Caller ID" value={ticket.caller_id} />
            <Field label="Ticket ID" value={ticket.id} mono />
            <Field label="Created" value={new Date(ticket.created_at).toLocaleString()} />
            <Field label="Updated" value={new Date(ticket.updated_at).toLocaleString()} />
          </div>
        </div>
      </div>

      {/* iTop payload preview */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
          <Clock size={11} /> iTop API Payload Preview
        </p>
        <pre className="text-[10px] text-gray-600 font-mono bg-white border border-gray-200 rounded-md p-2 overflow-x-auto leading-relaxed">
          {JSON.stringify({
            title: ticket.title,
            description: ticket.description.slice(0, 60) + '...',
            category: ticket.category,
            priority: ticket.priority,
            caller_id: ticket.caller_id,
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
