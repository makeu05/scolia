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
  payload: {
    libelle: string;
    idNature: string;
    auteur?: string;
    idPers?: string;
  },
  document?: File
): Promise<{ message: string; epreuve: Epreuve }> {
  const formData = new FormData();
  formData.append('libelle',  payload.libelle);
  formData.append('idNature', payload.idNature);
  formData.append('auteur',   payload.auteur ?? '');
  formData.append('idPers',   payload.idPers ?? '1');
  if (document) formData.append('document', document);

  const res = await fetch(`${API}/epreuves`, {
    method: 'POST',
    headers: authHeaders(), // pas de Content-Type pour FormData
    body: formData,
  });
  return handleResponse(res);
}

export async function updateEpreuve(
  id: number,
  payload: {
    libelle?: string;
    idNature?: string;
    auteur?: string;
  },
  document?: File
): Promise<{ message: string; epreuve: Epreuve }> {
  const formData = new FormData();
  formData.append('_method', 'PUT');
  if (payload.libelle)  formData.append('libelle',  payload.libelle);
  if (payload.idNature) formData.append('idNature', payload.idNature);
  if (payload.auteur !== undefined) formData.append('auteur', payload.auteur);
  if (document) formData.append('document', document);

  const res = await fetch(`${API}/epreuves/${id}`, {
    method: 'POST', // POST + _method PUT pour FormData
    headers: authHeaders(),
    body: formData,
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