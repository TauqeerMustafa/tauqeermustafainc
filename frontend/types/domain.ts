export interface CommonMetadata {
  id: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Service extends CommonMetadata {
  title: string;
  shortDescription: string;
  description: string;
  icon?: string;
  outcomes: string[];
}

export interface Blog extends CommonMetadata {
  title: string;
  excerpt: string;
  content?: string;
  category: string;
  isPublished: boolean;
  publishedAt?: string;
}

export interface Portfolio extends CommonMetadata {
  title: string;
  summary: string;
  category: string;
  impact?: string;
  technologies: string[];
  gallery?: string[];
}

export interface Career extends CommonMetadata {
  title: string;
  location: string;
  type: string;
  summary: string;
  responsibilities?: string[];
  isOpen: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  company?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Contact {
  name: string;
  email: string;
  message: string;
  company?: string;
}

export interface User extends CommonMetadata {
  name: string;
  email: string;
  role?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}
