const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Inscription {
  idFrequente: number;
  idSalle: number;
  idAcademi: number;
  matricule: number;
  commentaire: string;
  idAdmin: number;
  eleve?: {
    matricule: number;
    nom: string;
    prenom: string;
    sexe: number;
    actif: number;
  };
  salle?: {
    idSalle: number;
    libelle: string;
    idClasse: number;
    classe?: { idClasse: number; libelle: string; cycle?: { libelle: string } };
  };
  annee_academique?: {
    idAnnee: number;
    libelle: string;
    periode: string;
  };
}

export interface InscriptionPaginate {
  data: Inscription[];
  total: number;
  last_page: number;
  current_page: number;
}

export interface InscriptionFilters {
  page?: number;
  search?: string;
  idClasse?: string;
  idAcademi?: string;
}

export interface Classe {
  idClasse: number;
  libelle: string;
  cycle?: { libelle: string };
}

export interface Salle {
  idSalle: number;
  libelle: string;
  surface: string;
  idClasse: number;
}

export interface AnneeAcademique {
  idAnnee: number;
  libelle: string;
  periode: string;
}

export interface Eleve {
  matricule: number;
  nom: string;
  prenom: string;
  sexe: number;
  actif: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getToken(): string {
  return localStorage.getItem('token') ?? '';
}

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
  if (!res.ok) throw new Error(data.message ?? 'Une erreur est survenue');
  return data as T;
}

// ─── Inscriptions ─────────────────────────────────────────────────────────────

export async function getInscriptions(
  filters: InscriptionFilters = {}
): Promise<InscriptionPaginate> {
  const params = new URLSearchParams();
  if (filters.page)     params.append('page',      String(filters.page));
  if (filters.search)   params.append('search',    filters.search);
  if (filters.idClasse) params.append('idClasse',  filters.idClasse);
  if (filters.idAcademi)params.append('idAcademi', filters.idAcademi);

  const res = await fetch(`${API}/inscriptions?${params}`, {
    headers: authHeaders(),
  });
  return handleResponse<InscriptionPaginate>(res);
}

export async function getInscription(id: number): Promise<Inscription> {
  const res = await fetch(`${API}/inscriptions/${id}`, {
    headers: authHeaders(),
  });
  return handleResponse<Inscription>(res);
}

export async function createInscription(payload: {
  matricule: number | string;
  idSalle: number | string;
  idAcademi: number | string;
  commentaire?: string;
  idAdmin: number | string;
}): Promise<{ message: string; frequente: Inscription }> {
  const res = await fetch(`${API}/inscriptions`, {
    method: 'POST',
    headers: authJsonHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateInscription(
  id: number,
  payload: { idSalle?: number | string; commentaire?: string }
): Promise<{ message: string; frequente: Inscription }> {
  const res = await fetch(`${API}/inscriptions/${id}`, {
    method: 'PUT',
    headers: authJsonHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteInscription(id: number): Promise<{ message: string }> {
  const res = await fetch(`${API}/inscriptions/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function getElevesByClasse(
  idClasse: number | string,
  idAcademi: number | string
): Promise<Eleve[]> {
  const res = await fetch(
    `${API}/inscriptions/eleves-classe?idClasse=${idClasse}&idAcademi=${idAcademi}`,
    { headers: authHeaders() }
  );
  return handleResponse<Eleve[]>(res);
}

// ─── Données annexes ─────────────────────────────────────────────────────────

export async function getClasses(): Promise<Classe[]> {
  const res = await fetch(`${API}/classes`, { headers: authHeaders() });
  const data = await handleResponse<any>(res);
  return data.data ?? data;
}

export async function getSallesByClasse(idClasse: number | string): Promise<Salle[]> {
  const res = await fetch(`${API}/salles?idClasse=${idClasse}&actif=1`, {
    headers: authHeaders(),
  });
  return handleResponse<Salle[]>(res);
}

export async function getAnnees(): Promise<AnneeAcademique[]> {
  const res = await fetch(`${API}/annees`, { headers: authHeaders() });
  return handleResponse<AnneeAcademique[]>(res);
}

export async function searchEleves(query: string): Promise<Eleve[]> {
  if (!query || query.length < 2) return [];

  const res = await fetch(
    `${API}/eleves?search=${encodeURIComponent(query)}&actif=1`,
    { headers: authHeaders() }
  );

  const data = await handleResponse<any>(res);

  // Laravel paginate retourne data.data, sinon tableau direct
  const liste = data.data ?? data;

  // S'assurer que c'est bien un tableau
  if (!Array.isArray(liste)) return [];

  return liste;
}