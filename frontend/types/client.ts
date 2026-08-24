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
}

export interface ClientOverview {
  user: ClientUser;
  projects: ClientProject[];
  messages: ClientMessage[];
  unreadMessages: number;
}
