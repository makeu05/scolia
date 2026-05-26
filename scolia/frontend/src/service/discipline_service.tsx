import { getToken } from './auth';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

// ─── Types ───────────────────────────────────────────────────

export interface TypeDiscipline {
  ID:      number;
  libelle: string;
  points:  number;
}

export interface Justificatif {
  ID:           number;
  idRapport:    number;
  commentaire:  string;
  idDirecteur?: number;
  urlDoc?:      string;
  created_at?:  string;
}

export interface Rapport {
  idRap:        number;
  libelle:      string;
  points:       number;
  matricule:    number;
  idAca:        number;
  commentaire:  string;
  event_date:   string;
  idPers:       number;
  eleve?:       { matricule: number; nom: string; prenom: string; classe?: string };
  personne?:    { idPers: number; nom: string; prenom: string };
  justificatifs?: Justificatif[];
}

export interface RapportPayload {
  libelle:     string;
  points:      number;
  matricule:   number;
  idAca:       number;
  commentaire: string;
  event_date:  string;
  idPers:      number;
}

export interface CumulPoints {
  matricule:      number;
  totalPoints:    number;
  nbreIncidents:  number;
  rapports:       Rapport[];
}

// ─── Helpers ─────────────────────────────────────────────────

function authJsonHeaders(): HeadersInit {
  return {
    Authorization:  `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Une erreur est survenue');
  return data as T;
}

// ─── Types d'incidents (barème) ──────────────────────────────

export async function getTypesDiscipline(): Promise<TypeDiscipline[]> {
  const res = await fetch(`${API}/discipline/types`, {
    headers: authJsonHeaders(),
  });
  return handleResponse<TypeDiscipline[]>(res);
}

// ─── Rapports ────────────────────────────────────────────────

export async function getRapports(matricule?: number): Promise<Rapport[]> {
  const params = new URLSearchParams();
  if (matricule) params.append('matricule', String(matricule));

  const res = await fetch(`${API}/discipline?${params}`, {
    headers: authJsonHeaders(),
  });
  return handleResponse<Rapport[]>(res);
}

export async function getRapport(id: number): Promise<Rapport> {
  const res = await fetch(`${API}/discipline/${id}`, {
    headers: authJsonHeaders(),
  });
  return handleResponse<Rapport>(res);
}

export async function createRapport(
  payload: RapportPayload
): Promise<{ message: string; rapport: Rapport }> {
  const res = await fetch(`${API}/discipline`, {
    method:  'POST',
    headers: authJsonHeaders(),
    body:    JSON.stringify({ idRap: Date.now(), ...payload }),
  });
  return handleResponse(res);
}

export async function updateRapport(
  id: number,
  payload: Partial<RapportPayload>
): Promise<{ message: string; rapport: Rapport }> {
  const res = await fetch(`${API}/discipline/${id}`, {
    method:  'PUT',
    headers: authJsonHeaders(),
    body:    JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function validerRapport(
  id: number,
  idDirecteur: number,
  commentaire: string
): Promise<{ message: string; justificatif: Justificatif }> {
  const res = await fetch(`${API}/discipline/${id}/valider`, {
    method:  'POST',
    headers: authJsonHeaders(),
    body:    JSON.stringify({ ID: Date.now(), idDirecteur, commentaire }),
  });
  return handleResponse(res);
}

export async function deleteRapport(id: number): Promise<{ message: string }> {
  const res = await fetch(`${API}/discipline/${id}`, {
    method:  'DELETE',
    headers: authJsonHeaders(),
  });
  return handleResponse(res);
}

export async function getCumulPoints(matricule: number): Promise<CumulPoints> {
  const res = await fetch(`${API}/discipline/cumul/${matricule}`, {
    headers: authJsonHeaders(),
  });
  return handleResponse<CumulPoints>(res);
}

// ─── Helpers UI ──────────────────────────────────────────────

export function getSeverite(points: number): { label: string; color: string } {
  if (points <= 3)  return { label: 'Mineur', color: 'text-blue-700 bg-blue-100' };
  if (points <= 10) return { label: 'Moyen',  color: 'text-yellow-700 bg-yellow-100' };
  return               { label: 'Grave',  color: 'text-red-700 bg-red-100' };
}
