export type TicketType = "incident" | "service_request";

export type Priority = "Critical" | "High" | "Medium" | "Low";

export type Status = "Open" | "In Progress" | "Pending" | "Resolved" | "Closed";

export type Impact = "High" | "Medium" | "Low";

export type Urgency = "High" | "Medium" | "Low";

export type Intent = "incident" | "service_request";

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  priority: Priority;
  status: Status;
  type: TicketType;
  impact: Impact;
  urgency: Urgency;
  assigned_team: string;
  caller_id: string;
  session_id: string;
  created_at: string;
  updated_at: string;
  confidence?: number; 
  assigned_to?: string;
  agents?: {
    id: string;
    name: string;
  };
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  metadata?: {
    intent?: Intent;
    stage?: string;
    ticket_id?: string | null;
    [key: string]: unknown;
  };
  created_at: string;
}

export interface Conversation {
  id: string;
  ticket_id: string | null;
  session_id: string;
  intent: Intent | null;
  stage: string;
  collected_data: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface ChatResponse {
  reply: string;
  stage: string;
  intent: Intent | null;
  ticket_created: boolean;
  ticket_id: string | null;
}

export interface Stats {
  total: number;
  incidents: number;
  requests: number;
  open: number;
  inProgress: number;
  resolved: number;
  critical: number;
}

export type TicketListResponse = Ticket[];