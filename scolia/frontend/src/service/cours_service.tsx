// src/service/cours_service.ts
const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

import { authFetch, getToken } from './auth';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface Cours {
  idCours: number;
  libelle: string;
  note?: number;
  coefficient?: number;
  description?: string;
  actif: number;
  idClasse: number;
  idAdmin: number;
  idLivre?: number;

  classe?: {
    idClasse: number;
    libelle: string;
  };
  enseignant?: {
    idEnseignant: number;
    personne?: {
      nom: string;
      prenom: string;
    };
  };
}

export interface CoursPaginate {
  data: Cours[];
  total: number;
  last_page: number;
  current_page: number;
}

export interface CoursFilters {
  page?: number;
  search?: string;
  idClasse?: number | string;
  actif?: string;
    paginate?: 'false' | 'true'; 
}

export interface CoursPayload {
  libelle: string;
  note?: number;
  coefficient?: number;
  description?: string;
  idClasse: number | string;
  idAdmin?: number | string;
  idLivre?: number | string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
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
 * Liste paginée des cours
 */
export async function getCours(filters: CoursFilters = {}): Promise<any> {
  const params = new URLSearchParams();

  if (filters.page) params.append('page', String(filters.page));
  if (filters.search) params.append('search', filters.search);
  if (filters.idClasse) params.append('idClasse', String(filters.idClasse));
  if (filters.actif !== undefined) params.append('actif', filters.actif);
  
  // Gestion de la pagination
  if (filters.paginate === 'false') {
    params.append('paginate', 'false');
  }

  const res = await authFetch(`${API}/cours?${params}`, {
    headers: authHeaders(),
  });

  return handleResponse(res);
}

/**
 * Récupère un cours par ID
 */
export async function getCoursById(idCours: number | string): Promise<Cours> {
  const res = await authFetch(`${API}/cours/${idCours}`, {
    headers: authHeaders(),
  });
  return handleResponse<Cours>(res);
}

/**
 * Crée un nouveau cours
 */
export async function createCours(payload: CoursPayload): Promise<{ message: string; cours: Cours }> {
  const res = await authFetch(`${API}/cours`, {
    method: 'POST',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(res);
}

/**
 * Met à jour un cours
 */
export async function updateCours(
  idCours: number | string,
  payload: Partial<CoursPayload>
): Promise<{ message: string; cours: Cours }> {
  const res = await authFetch(`${API}/cours/${idCours}`, {
    method: 'PUT',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(res);
}

/**
 * Supprime un cours
 */
export async function deleteCours(idCours: number | string): Promise<{ message: string }> {
  const res = await authFetch(`${API}/cours/${idCours}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  return handleResponse(res);
}