const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://yassirhakimi-recruiteia-api.hf.space/api';
const TOKEN_KEY = 'recruteIA_token';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

function getHeaders(isFormData = false): HeadersInit {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';
  return headers;
}

function getErrorMessage(data: unknown, status: number): string {
  const d = data as Record<string, unknown>;
  return (d?.error as Record<string, string>)?.message
    || (d?.detail as string)
    || (d?.message as string)
    || `Erreur ${status}`;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  isFormData = false
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...getHeaders(isFormData), ...options.headers },
  });

  // Empty body for 204
  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = getErrorMessage(data, res.status);
    throw new ApiError(res.status, msg);
  }

  // Unwrap {success, data} envelope
  return (data?.data !== undefined ? data.data : data) as T;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const auth = {
  register: (body: { email: string; password: string; full_name: string }) =>
    request<User>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  me: () => request<User>('/auth/me'),
};

// ─── Stats ───────────────────────────────────────────────────────────────────

export interface Stats {
  total_offers: number;
  total_sessions: number;
  total_cvs: number;
  active_sessions: number;
  completed_sessions?: number;
  total_candidates_scored?: number;
}

export const stats = {
  summary: () => request<Stats>('/stats/summary'),
};

// ─── Offers ──────────────────────────────────────────────────────────────────

export interface RequiredLanguage {
  language: string;
  min_level: string;
  weight: number;
}

export interface Offer {
  id: string;
  job_title: string;
  title?: string;
  company_name: string;
  company?: string;
  industry: string;
  job_type: string;
  location: string;
  remote_ok: boolean;
  required_skills: string[];
  critical_skills: string[];
  required_soft_skills: string[];
  required_languages: RequiredLanguage[];
  experience_required_years: number;
  experience_level?: string;
  domain?: string;
  education_required?: string;
  min_education: string;
  job_description?: string;
  status: 'active' | 'closed';
  created_at: string;
}

export interface ExtractedOffer extends Omit<Offer, 'id' | 'status' | 'created_at' | 'company_name' | 'industry' | 'job_type'> {
  company_name?: string;
  industry?: string;
  job_type?: string;
}

export const offers = {
  extract: (body: { text: string; lang?: string }) =>
    request<ExtractedOffer>('/offers/extract', { method: 'POST', body: JSON.stringify(body) }),

  list: () => request<Offer[]>('/offers'),

  get: (id: string) => request<Offer>(`/offers/${id}`),

  create: (body: Partial<Offer>) =>
    request<Offer>('/offers', { method: 'POST', body: JSON.stringify(body) }),

  update: (id: string, body: Partial<Offer>) =>
    request<Offer>(`/offers/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  delete: (id: string) =>
    request<void>(`/offers/${id}`, { method: 'DELETE' }),
};

// ─── CVs ─────────────────────────────────────────────────────────────────────

export interface LanguageSpoken {
  language: string;
  level: string;
}

export interface ConfidenceScore {
  confidence: number;
  missing_fields: string[];
  has_critical_flags: boolean;
}

export interface CV {
  id: string;
  filename: string;
  extraction_status: 'done' | 'failed';
  language: string;
  is_duplicate: boolean;
  duplicate_of: string | null;
  candidate_name: string | null;
  candidate_email: string | null;
  email?: string | null;
  candidate_phone: string | null;
  phone?: string | null;
  candidate_location: string | null;
  location?: string | null;
  candidate_linkedin: string | null;
  candidate_github: string | null;
  skills: string[];
  soft_skills: string[];
  languages_spoken: LanguageSpoken[];
  languages?: string[];
  experience_years: number;
  experience?: unknown[];
  education_level: string;
  education?: unknown[];
  confidence_score: ConfidenceScore;
  flags: string[];
  created_at: string;
}

export const cvs = {
  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return request<CV>('/cvs', { method: 'POST', body: form }, true);
  },

  list: () => request<CV[]>('/cvs'),

  get: (id: string) => request<CV>(`/cvs/${id}`),
};

// ─── Sessions ────────────────────────────────────────────────────────────────

export interface Weights {
  skills_match: number;
  experience_relevance: number;
  achievements: number;
  language_quality: number;
  language_match: number;
  education: number;
  location: number;
}

export interface Session {
  id: string;
  name: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  offer_id: string;
  job_offer_id?: string;
  total_cvs: number;
  cv_count?: number;
  processed_cvs: number;
  weights: Weights;
  created_at: string;
  completed_at: string | null;
  error?: string;
}

export interface LanguageDetail {
  language: string;
  found_score: number;
  meets_min: boolean;
}

export interface ResultRow {
  rank: number;
  cv_id: string;
  candidate_name: string;
  candidate_email: string;
  email?: string;
  candidate_phone: string;
  candidate_location: string;
  total_score: number;
  final_score_pct: number;
  recommendation: string;
  threshold: 'green' | 'orange' | 'red';
  skills_score: number;
  experience_score: number;
  achievements_score: number;
  language_quality_score: number;
  language_match_score: number;
  education_score: number;
  location_score: number;
  matched_skills: string[];
  missing_skills: string[];
  critical_missing: string[];
  language_details: LanguageDetail[];
  flags: string[];
  status: string;
  strengths?: string[];
}

export const sessions = {
  create: (body: { name?: string; offer_id: string; cv_ids: string[]; weights: Weights }) =>
    request<Session>('/sessions', { method: 'POST', body: JSON.stringify(body) }),

  score: (id: string) =>
    request<{ message: string; session_id: string }>(`/sessions/${id}/score`, { method: 'POST' }),

  list: () => request<Session[]>('/sessions'),

  get: (id: string) => request<Session>(`/sessions/${id}`),

  results: (id: string) => request<ResultRow[]>(`/sessions/${id}/results`),

  exportUrl: (id: string) => {
    const token = getToken();
    return `${API_BASE}/sessions/${id}/export?token=${token}`;
  },

  exportBlob: async (id: string): Promise<Blob> => {
    const res = await fetch(`${API_BASE}/sessions/${id}/export`, {
      headers: getHeaders() as Record<string, string>,
    });
    if (!res.ok) throw new ApiError(res.status, 'Export failed');
    return res.blob();
  },
};

export interface SessionResults {
  results: ResultRow[];
  summary?: {
    avg_score?: number;
    above_threshold?: number;
    top_candidate?: string;
  };
}

// ─── Flat api facade ─────────────────────────────────────────────────────────

export const api = {
  // Auth
  login: auth.login,
  register: auth.register,
  me: auth.me,

  // Stats
  getStats: () => stats.summary(),

  // Offers
  getOffers: offers.list,
  getOffer: offers.get,
  createOffer: (body: Record<string, unknown>) => offers.create(body as Partial<Offer>),
  updateOffer: (id: string, body: Record<string, unknown>) => offers.update(id, body as Partial<Offer>),
  deleteOffer: offers.delete,
  extractOffer: offers.extract,

  // CVs
  uploadCV: cvs.upload,
  getCVs: cvs.list,
  getCV: cvs.get,
  deleteCV: (id: string) => request<void>(`/cvs/${id}`, { method: 'DELETE' }),

  // Sessions
  getSessions: sessions.list,
  getSession: sessions.get,
  createSession: sessions.create,
  startScoring: sessions.score,
  getResults: async (id: string): Promise<SessionResults> => {
    const rows = await sessions.results(id);
    return { results: rows };
  },
  exportCSV: sessions.exportBlob,
  exportPDF: sessions.exportBlob,
};


