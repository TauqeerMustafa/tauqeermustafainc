export interface ClientUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  status: string;
  permissions: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientProject {
  id: string;
  name: string;
  status: string;
  summary?: string | null;
  nextMilestone?: string | null;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClientMessage {
  id: string;
  projectId?: string | null;
  authorName: string;
  body: string;
  createdAt: string;
  /** True when the TMI team wrote it, false for the client's own note. */
  fromTeam?: boolean;
  readAt?: string | null;
}

export interface ClientOverview {
  user: ClientUser;
  projects: ClientProject[];
  messages: ClientMessage[];
  unreadMessages: number;
}

/** One message in the staff-side inbox — see `GET /clients/threads`. */
export interface ClientThreadMessage extends ClientMessage {
  clientId: string;
  clientName: string;
  clientEmail: string;
  fromTeam: boolean;
}

/** A client's whole conversation, newest message first. */
export interface ClientThread {
  clientId: string;
  clientName: string;
  clientEmail: string;
  lastMessageAt?: string | null;
  /** Client notes with no team reply after them — the queue staff must work. */
  awaitingReply: number;
  messages: ClientThreadMessage[];
}
