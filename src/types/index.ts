import { Request } from 'express';

// ─── Auth ─────────────────────────────────────────────────────────────
export interface JwtPayload {
  userId: number;
  email:  string;
  role:   'user' | 'admin';
  iat?:   number;
  exp?:   number;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// ─── DB row shapes ────────────────────────────────────────────────────
export interface UserRow {
  id:           number;
  name:         string;
  email:        string;
  password:     string;
  role:         'user' | 'admin';
  is_active:    number;
  created_at:   string;
  updated_at:   string;
}

export interface DomainRow {
  id:          number;
  name:        string;
  slug:        string;
  description: string;
  icon:        string;
  is_active:   number;
  created_at:  string;
}

export interface SessionRow {
  id:           number;
  user_id:      number;
  domain_id:    number;
  domain_name:  string;
  difficulty:   'Easy' | 'Medium' | 'Hard';
  score:        number;
  total_q:      number;
  verdict:      string;
  created_at:   string;
}

export interface QuestionRow {
  id:           number;
  domain_id:    number;
  difficulty:   'Easy' | 'Medium' | 'Hard';
  question:     string;
  topic:        string;
  hint:         string;
  ideal_answer: string;
  is_active:    number;
}

// ─── API response helper ──────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?:   T;
  errors?: unknown;
}
