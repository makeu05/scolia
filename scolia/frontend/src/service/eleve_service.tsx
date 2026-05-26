const API =
  import.meta.env.VITE_API_URL ??
  'http://localhost:8000/api';

import { authFetch, getToken } from '../service/auth';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Eleve {
  matricule: number;
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance: string;
  sexe: number;
  langue: string;
  photoURL: string;
  actif: number;
  idVilleNaissance: number;
  idAdmin: number;
  villeNaissance?: { idVille: number; libelle: string };
  parents?: Parent[];
}

export interface Parent {
  idParent: number;
  idPers: number;
  matricule: number;
  personne?: {
    nom: string;
    prenom: string;
    mobile: string;
    typePersonne: number;
  };
}

export interface ElevePaginate {
  data: Eleve[];
  total: number;
  last_page: number;
  current_page: number;
}

export interface EleveFilters {
  page?: number;
  search?: string;
  actif?: string;
  sexe?: string;
  idVille?: string;
}

export interface ElevePayload {
  matricule: number | string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance: string;
  sexe: number | string;
  langue?: string;
  idVilleNaissance: number | string;
  idAdmin?: number | string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function authHeaders(): HeadersInit {
  return { Authorization: `Bearer ${getToken()}` };
}

function authJsonHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message ?? 'Une erreur est survenue');
  }
  return data as T;
}

// ─── Fonctions ───────────────────────────────────────────────────────────────

/**
 * Récupère la liste paginée des élèves avec filtres optionnels
 */
export async function getEleves(filters: EleveFilters = {}): Promise<ElevePaginate> {
  const params = new URLSearchParams();

  if (filters.page)    params.append('page',    String(filters.page));
  if (filters.search)  params.append('search',  filters.search);
  if (filters.actif !== undefined && filters.actif !== '')
                       params.append('actif',   filters.actif);
  if (filters.sexe !== undefined && filters.sexe !== '')
                       params.append('sexe',    filters.sexe);
  if (filters.idVille) params.append('idVille', filters.idVille);

  const res = await authFetch(`${API}/eleves?${params}`, {
    headers: authHeaders(),
  });

  return handleResponse<ElevePaginate>(res);
}

/**
 * Récupère le détail d'un élève par matricule
 */
export async function getEleve(matricule: number | string): Promise<Eleve> {
  const res = await authFetch(`${API}/eleves/${matricule}`, {
    headers: authHeaders(),
  });

  return handleResponse<Eleve>(res);
}

/**
 * Crée un nouvel élève (avec photo optionnelle)
 */
export async function createEleve(
  payload: ElevePayload,
  photo?: File
): Promise<{ message: string; eleve: Eleve }> {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  if (photo) formData.append('photo', photo);

  const res = await authFetch(`${API}/eleves`, {
    method: 'POST',
    headers: authHeaders(), // pas de Content-Type pour FormData
    body: formData,
  });

  return handleResponse(res);
}

/**
 * Modifie un élève existant (avec photo optionnelle)
 */
export async function updateEleve(
  matricule: number | string,
  payload: Partial<ElevePayload>,
  photo?: File
): Promise<{ message: string; eleve: Eleve }> {
  const formData = new FormData();
  formData.append('_method', 'PUT');

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  if (photo) formData.append('photo', photo);

  const res = await authFetch(`${API}/eleves/${matricule}`, {
    method: 'POST', // POST + _method PUT pour FormData
    headers: authHeaders(),
    body: formData,
  });

  return handleResponse(res);
}

/**
 * Archive un élève (actif = 0)
 */
export async function archiverEleve(
  matricule: number | string
): Promise<{ message: string }> {
  const res = await authFetch(`${API}/eleves/${matricule}/archiver`, {
    method: 'PATCH',
    headers: authHeaders(),
  });

  return handleResponse(res);
}

/**
 * Réactive un élève (actif = 1)
 */
export async function reactiverEleve(
  matricule: number | string
): Promise<{ message: string }> {
  const res = await authFetch(`${API}/eleves/${matricule}/reactiver`, {
    method: 'PATCH',
    headers: authHeaders(),
  });

  return handleResponse(res);
}

/**
 * Supprime définitivement un élève
 */
export async function deleteEleve(matricule: number | string): Promise<{ message: string }> {
  const res = await authFetch(`${API}/eleves/${matricule}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  return handleResponse(res);
}
/**
 * Récupère les parents d'un élève
 */
export async function getParentsEleve(
  matricule: number | string
): Promise<Parent[]> {
  const res = await authFetch(`${API}/eleves/${matricule}/parents`, {
    headers: authHeaders(),
  });

  return handleResponse<Parent[]>(res);
}

/**
 * Ajoute un parent à un élève
 */
export async function addParentEleve(
  matricule: number | string,
  payload: {
    idPers: number | string;
    nom: string;
    prenom: string;
    mobile: string;
    phone?: string;
    username: string;
    password: string;
    idAdmin: number | string;
  }
): Promise<{ message: string; parent: Parent }> {
  const res = await authFetch(`${API}/eleves/${matricule}/parents`, {
    method: 'POST',
    headers: authJsonHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse(res);
}

/**
 * Supprime un parent d'un élève
 */
export async function deleteParentEleve(
  matricule: number | string,
  idParent: number | string
): Promise<{ message: string }> {
  const res = await authFetch(`${API}/eleves/${matricule}/parents/${idParent}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  return handleResponse(res);
}

/**
 * Récupère les élèves d'une classe pour une année académique
 * (utilisé dans la saisie des notes)
 */
export async function getElevesByClasse(
  idClasse: number | string,
  idAcademi: number | string
): Promise<Eleve[]> {
  const res = await authFetch(
    `${API}/inscriptions/eleves-classe?idClasse=${idClasse}&idAcademi=${idAcademi}`,
    { headers: authHeaders() }
  );

  return handleResponse<Eleve[]>(res);
}

/**
 * Recherche rapide d'élèves (pour les selects/autocomplete)
 */
export async function searchEleves(query: string): Promise<Eleve[]> {
  if (!query || query.length < 2) return [];

  const res = await authFetch(`${API}/eleves?search=${encodeURIComponent(query)}`, {
    headers: authHeaders(),
  });

  const data = await handleResponse<ElevePaginate>(res);
  return data.data;
}

/**
 * Retourne le label du sexe
 */
export function getSexeLabel(sexe: number): string {
  const map: Record<number, string> = {
    0: 'Fille',
    1: 'Garçon',
    2: 'Autre',
  };
  return map[sexe] ?? '—';
}

/**
 * Retourne le nom complet d'un élève
 */
export function getNomComplet(eleve: Eleve): string {
  return `${eleve.prenom} ${eleve.nom}`;
}

/**
 * Retourne l'URL complète de la photo d'un élève
 */
export function getPhotoUrl(photoURL: string): string {
  if (!photoURL || photoURL === 'INDEFINI') {
    return '/images/avatar-default.png';
  }
  if (photoURL.startsWith('http')) return photoURL;
  return `http://localhost:8000${photoURL}`;
}

/**
 * Récupère TOUS les élèves (sans pagination) - Idéal pour les selects/dropdowns
 */
export async function getAllEleves(): Promise<Eleve[]> {
  const res = await authFetch(`${API}/eleves?paginate=false`, {
    headers: authHeaders(),
  });

  const data = await handleResponse<any>(res);
  return Array.isArray(data) ? data : (data.data || []);
}