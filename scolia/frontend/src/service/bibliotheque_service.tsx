import { getToken } from './auth';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

export interface Specialite {
  idSpecialite: number;
  libelle:      string;
}

export interface Livre {
  idLivre:        number;
  titre:          string;
  auteurs:        string;
  prix:           number;
  idSpecialite:   number;
  edition:        string;
  annee_parution: string | null;
  idAdmin:        number;
  specialite?:    Specialite;
}

export interface LivrePaginate {
  data:         Livre[];
  total:        number;
  last_page:    number;
  current_page: number;
}

export interface LivrePayload {
  titre:           string;
  auteurs:         string;
  prix:            number;
  idSpecialite:    number;
  edition?:        string;
  annee_parution?: string | null;
  idAdmin:         number;
}

export interface LivreFilters {
  page?:         number;
  search?:       string;
  idSpecialite?: number | string;
}

function authJsonHeaders(): HeadersInit {
  return {
    Authorization:  `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? `Erreur ${res.status}`);
  return data as T;
}

// ─── Spécialités ─────────────────────────────────────────────

export async function getSpecialites(): Promise<Specialite[]> {
  const res = await fetch(`${API}/specialites`, { headers: authJsonHeaders() });
  return handleResponse<Specialite[]>(res);
}

export async function createSpecialite(
  libelle: string,
  idAdmin: number
): Promise<{ message: string; specialite: Specialite }> {
  const res = await fetch(`${API}/specialites`, {
    method:  'POST',
    headers: authJsonHeaders(),
    body:    JSON.stringify({ libelle, idAdmin }),
  });
  return handleResponse(res);
}

export async function updateSpecialite(
  id: number,
  libelle: string
): Promise<{ message: string; specialite: Specialite }> {
  const res = await fetch(`${API}/specialites/${id}`, {
    method:  'PUT',
    headers: authJsonHeaders(),
    body:    JSON.stringify({ libelle }),
  });
  return handleResponse(res);
}

export async function deleteSpecialite(id: number): Promise<{ message: string }> {
  const res = await fetch(`${API}/specialites/${id}`, {
    method:  'DELETE',
    headers: authJsonHeaders(),
  });
  return handleResponse(res);
}

// ─── Livres ──────────────────────────────────────────────────

export async function getLivres(filters: LivreFilters = {}): Promise<LivrePaginate> {
  const params = new URLSearchParams();
  if (filters.page)         params.append('page',         String(filters.page));
  if (filters.search)       params.append('search',       filters.search);
  if (filters.idSpecialite) params.append('idSpecialite', String(filters.idSpecialite));

  const res = await fetch(`${API}/bibliotheque?${params}`, { headers: authJsonHeaders() });
  return handleResponse<LivrePaginate>(res);
}

export async function getLivre(id: number): Promise<Livre> {
  const res = await fetch(`${API}/bibliotheque/${id}`, { headers: authJsonHeaders() });
  return handleResponse<Livre>(res);
}

export async function createLivre(
  payload: LivrePayload  // ✅ plus d'idLivre ici — généré par le backend
): Promise<{ message: string; livre: Livre }> {
  const res = await fetch(`${API}/bibliotheque`, {
    method:  'POST',
    headers: authJsonHeaders(),
    body:    JSON.stringify(payload), // ✅ pas de Date.now()
  });
  return handleResponse(res);
}

export async function updateLivre(
  id: number,
  payload: Partial<LivrePayload>
): Promise<{ message: string; livre: Livre }> {
  const res = await fetch(`${API}/bibliotheque/${id}`, {
    method:  'PUT',
    headers: authJsonHeaders(),
    body:    JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteLivre(id: number): Promise<{ message: string }> {
  const res = await fetch(`${API}/bibliotheque/${id}`, {
    method:  'DELETE',
    headers: authJsonHeaders(),
  });
  return handleResponse(res);
}
