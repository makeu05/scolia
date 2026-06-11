// src/service/eleve_service.ts — version corrigée

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

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
  idAdmin: number;
  // Nouveaux champs
  religion?: string;
  situation_familiale?: string;
  contact_urgence_nom?: string;
  contact_urgence_tel?: string;
  contact_urgence_lien?: string;
  tuteur_nom?: string;
  tuteur_tel?: string;
  tuteur_profession?: string;
  parents?: Parent[];
}

export interface Parent {
  idParent: number;
  idPers: number;
  matricule: number;
  lien?: string;
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
}

// ✅ ElevePayload mis à jour avec tous les champs
export interface ElevePayload {
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance: string;
  sexe: number | string;
  langue?: string;
  idAdmin?: number | string;
  // Nouveaux champs
  religion?: string;
  situation_familiale?: string;
  contact_urgence_nom?: string;
  contact_urgence_tel?: string;
  contact_urgence_lien?: string;
  tuteur_nom?: string;
  tuteur_tel?: string;
  tuteur_profession?: string;
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
  if (!res.ok) throw new Error(data.message ?? 'Une erreur est survenue');
  return data as T;
}

// ─── Fonctions ───────────────────────────────────────────────────────────────

export async function getEleves(filters: EleveFilters = {}): Promise<ElevePaginate> {
  const params = new URLSearchParams();
  if (filters.page)   params.append('page',   String(filters.page));
  if (filters.search) params.append('search', filters.search);
  if (filters.actif !== undefined && filters.actif !== '')
                      params.append('actif',  filters.actif);
  if (filters.sexe !== undefined && filters.sexe !== '')
                      params.append('sexe',   filters.sexe);

  const res = await authFetch(`${API}/eleves?${params}`);
  return handleResponse<ElevePaginate>(res);
}

export async function getEleve(matricule: number | string): Promise<Eleve> {
  const res = await authFetch(`${API}/eleves/${matricule}`);
  return handleResponse<Eleve>(res);
}

export async function createEleve(
  payload: ElevePayload,
  photo?: File
): Promise<{ message: string; eleve: Eleve }> {
  const fd = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      fd.append(key, String(value));
    }
  });

  if (photo) fd.append('photo', photo);

  const res = await authFetch(`${API}/eleves`, {
    method: 'POST',
    headers: authHeaders(),
    body: fd,
  });
  return handleResponse(res);
}

export async function updateEleve(
  matricule: number | string,
  payload: Partial<ElevePayload>,
  photo?: File
): Promise<{ message: string; eleve: Eleve }> {
  const fd = new FormData();
  fd.append('_method', 'PUT');

  // ✅ En modification : envoyer TOUS les champs, même vides
  // pour permettre d'effacer une valeur existante
  Object.entries(payload).forEach(([key, value]) => {
    fd.append(key, value !== undefined && value !== null ? String(value) : '');
  });

  if (photo) fd.append('photo', photo);

  const res = await authFetch(`${API}/eleves/${matricule}`, {
    method: 'POST',
    headers: authHeaders(),
    body: fd,
  });
  return handleResponse(res);
}

export async function archiverEleve(matricule: number | string): Promise<{ message: string }> {
  const res = await authFetch(`${API}/eleves/${matricule}/archiver`, { method: 'PATCH' });
  return handleResponse(res);
}

export async function reactiverEleve(matricule: number | string): Promise<{ message: string }> {
  const res = await authFetch(`${API}/eleves/${matricule}/reactiver`, { method: 'PATCH' });
  return handleResponse(res);
}

export async function deleteEleve(matricule: number | string): Promise<{ message: string }> {
  const res = await authFetch(`${API}/eleves/${matricule}`, { method: 'DELETE' });
  return handleResponse(res);
}

export async function getParentsEleve(matricule: number | string): Promise<Parent[]> {
  const res = await authFetch(`${API}/eleves/${matricule}/parents`);
  return handleResponse<Parent[]>(res);
}

export async function deleteParentEleve(
  matricule: number | string,
  idParent: number | string
): Promise<{ message: string }> {
  const res = await authFetch(`${API}/eleves/${matricule}/parents/${idParent}`, { method: 'DELETE' });
  return handleResponse(res);
}

export async function getElevesByClasse(
  idClasse: number | string,
  idAcademi: number | string
): Promise<Eleve[]> {
  const res = await authFetch(
    `${API}/inscriptions/eleves-classe?idClasse=${idClasse}&idAcademi=${idAcademi}`
  );
  return handleResponse<Eleve[]>(res);
}

export async function searchEleves(query: string): Promise<Eleve[]> {
  if (!query || query.length < 2) return [];
  const res = await authFetch(`${API}/eleves?search=${encodeURIComponent(query)}`);
  const data = await handleResponse<ElevePaginate>(res);
  return data.data;
}

export async function getAllEleves(): Promise<Eleve[]> {
  const res = await authFetch(`${API}/eleves?paginate=false`);
  const data = await handleResponse<any>(res);
  return Array.isArray(data) ? data : (data.data || []);
}

export function getSexeLabel(sexe: number): string {
  return { 0: 'Fille', 1: 'Garçon', 2: 'Autre' }[sexe] ?? '—';
}

export function getNomComplet(eleve: Eleve): string {
  return `${eleve.prenom} ${eleve.nom}`;
}

export function getPhotoUrl(photoURL?: string): string | null {
  if (!photoURL || photoURL === 'INDEFINI') return null;
  if (photoURL.startsWith('http')) return photoURL;
  const SERVER = import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:8000';
  return `${SERVER}/storage/${photoURL}`;
}