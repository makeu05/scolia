const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

// ─── Types ───────────────────────────────────────────────────

export interface Epreuve {
  idEpreuve: number;
  libelle: string;
  urlDoc: string;
  auteur: string;
  idNature: number;
  idPers: number;
  nature?: { idNature: number; libelle: string };
  evaluations?: any[];
}

export interface EpreuvePaginate {
  data: Epreuve[];
  total: number;
  last_page: number;
  current_page: number;
}

export interface EpreuveFilters {
  page?: number;
  search?: string;
  idNature?: string;
  idPers?: string;
}

// ─── Helpers ─────────────────────────────────────────────────

function getToken(): string {
  return localStorage.getItem('token') ?? '';
}

function authHeaders(): HeadersInit {
  return { Authorization: `Bearer ${getToken()}` };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Une erreur est survenue');
  return data as T;
}

// ─── Fonctions ───────────────────────────────────────────────

export async function getEpreuves(
  filters: EpreuveFilters = {}
): Promise<EpreuvePaginate> {
  const params = new URLSearchParams();
  if (filters.page)     params.append('page',      String(filters.page));
  if (filters.search)   params.append('search',    filters.search);
  if (filters.idNature) params.append('idNature',  filters.idNature);
  if (filters.idPers)   params.append('idPers',    filters.idPers);

  const res = await fetch(`${API}/epreuves?${params}`, {
    headers: authHeaders(),
  });
  return handleResponse<EpreuvePaginate>(res);
}

export async function getEpreuve(id: number): Promise<Epreuve> {
  const res = await fetch(`${API}/epreuves/${id}`, {
    headers: authHeaders(),
  });
  return handleResponse<Epreuve>(res);
}

export async function createEpreuve(
  payload: FormData
): Promise<{ message: string; epreuve: Epreuve }> {
  const res = await fetch(`${API}/epreuves`, {
    method: 'POST',
    headers: authHeaders(), // Le navigateur définit automatiquement le Content-Type pour le FormData
    body: payload,
  });
  return handleResponse(res);
}

export async function updateEpreuve(
  id: number,
  payload: FormData
): Promise<{ message: string; epreuve: Epreuve }> {
  // Pour supporter l'envoi de fichiers avec Laravel en modification, on utilise POST + _method PUT
  payload.append('_method', 'PUT');
  
  const res = await fetch(`${API}/epreuves/${id}`, {
    method: 'POST',
    headers: authHeaders(),
    body: payload,
  });
  return handleResponse(res);
}

export async function deleteEpreuve(
  id: number
): Promise<{ message: string }> {
  const res = await fetch(`${API}/epreuves/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export function getDocumentUrl(urlDoc: string): string | null {
  if (!urlDoc || urlDoc === 'INDEFINI') return null;
  if (urlDoc.startsWith('http')) return urlDoc;
  return `http://localhost:8000${urlDoc}`;
}