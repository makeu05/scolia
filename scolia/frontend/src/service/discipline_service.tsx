// src/service/discipline_service.ts

import { authFetch } from './auth';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

// ── Types ─────────────────────────────────────────────────────────────────────

export type Gravite = 'leger' | 'moyen' | 'grave';

export type TypeSanction =
  | 'avertissement'
  | 'blame'
  | 'convocation_parent'
  | 'exclusion_temporaire'
  | 'exclusion_definitive'
  | 'autre';

export interface Incident {
  idIncident: number;
  matricule: number;
  idPers: number;
  type: string;
  description: string;
  dateIncident: string;
  gravite: Gravite;
  eleve?: { matricule: number; nom: string; prenom: string };
  rapporteur?: { idPers: number; nom: string; prenom: string };
  sanctions?: Sanction[];
}

export interface Sanction {
  idSanction: number;
  idIncident: number;
  matricule: number;
  type: TypeSanction;
  motif: string;
  dateSanction: string;
  dateExpiration?: string;
  parentNotifie: boolean;
  parentNotifieAt?: string;
}

export interface IncidentPaginate {
  data: Incident[];
  total: number;
  last_page: number;
  current_page: number;
}

export interface DisciplineStats {
  total_incidents: number;
  graves: number;
  total_sanctions: number;
  par_type: { type: string; total: number }[];
  par_gravite: { gravite: string; total: number }[];
  eleves_recidivistes: { matricule: number; nb: number; eleve: any }[];
}

// ── Libellés ──────────────────────────────────────────────────────────────────

export const GRAVITE_LABEL: Record<Gravite, string> = {
  leger: 'Léger',
  moyen: 'Moyen',
  grave: 'Grave',
};

export const GRAVITE_COLOR: Record<Gravite, string> = {
  leger: 'badge-yellow',
  moyen: 'badge-orange',
  grave: 'badge-red',
};

export const SANCTION_LABEL: Record<TypeSanction, string> = {
  avertissement:         'Avertissement',
  blame:                 'Blâme',
  convocation_parent:    'Convocation des parents',
  exclusion_temporaire:  'Exclusion temporaire',
  exclusion_definitive:  'Exclusion définitive',
  autre:                 'Autre',
};

export const TYPES_INCIDENT = [
  'Bagarre', 'Insolence', 'Fraude / Triche', 'Vol',
  'Vandalisme', 'Absentéisme', 'Usage téléphone', 'Autre',
];

// ── Incidents ─────────────────────────────────────────────────────────────────

export async function getIncidents(filters?: {
  matricule?: number;
  gravite?: Gravite;
  type?: string;
  from?: string;
  to?: string;
  page?: number;
  per_page?: number;
}): Promise<IncidentPaginate> {
  const params = new URLSearchParams();
  if (filters?.matricule) params.append('matricule', String(filters.matricule));
  if (filters?.gravite)   params.append('gravite', filters.gravite);
  if (filters?.type)      params.append('type', filters.type);
  if (filters?.from)      params.append('from', filters.from);
  if (filters?.to)        params.append('to', filters.to);
  if (filters?.page)      params.append('page', String(filters.page));
  if (filters?.per_page)  params.append('per_page', String(filters.per_page));

  const res = await authFetch(`${API}/incidents?${params}`);
  if (!res.ok) throw new Error('Erreur chargement incidents');
  return res.json();
}

export async function getIncident(id: number): Promise<Incident> {
  const res = await authFetch(`${API}/incidents/${id}`);
  if (!res.ok) throw new Error('Incident introuvable');
  return res.json();
}

export async function getHistoriqueEleve(matricule: number) {
  const res = await authFetch(`${API}/eleves/${matricule}/discipline`);
  if (!res.ok) throw new Error('Erreur historique');
  return res.json() as Promise<{ total: number; graves: number; incidents: Incident[] }>;
}

export async function createIncident(payload: {
  matricule: number;
  idPers: number;
  type: string;
  description: string;
  dateIncident: string;
  gravite: Gravite;
  idAdmin: number;
}): Promise<Incident> {
  const res = await authFetch(`${API}/incidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur création incident');
  return data.incident;
}

export async function updateIncident(id: number, payload: Partial<Incident>): Promise<Incident> {
  const res = await authFetch(`${API}/incidents/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur modification');
  return data.incident;
}

export async function deleteIncident(id: number): Promise<void> {
  const res = await authFetch(`${API}/incidents/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erreur suppression');
}

// ── Sanctions ─────────────────────────────────────────────────────────────────

export async function createSanction(idIncident: number, payload: {
  type: TypeSanction;
  motif: string;
  dateSanction: string;
  dateExpiration?: string;
  idAdmin: number;
}): Promise<Sanction> {
  const res = await authFetch(`${API}/incidents/${idIncident}/sanctions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur création sanction');
  return data.sanction;
}

export async function updateSanction(idSanction: number, payload: Partial<Sanction>): Promise<Sanction> {
  const res = await authFetch(`${API}/sanctions/${idSanction}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur modification');
  return data.sanction;
}

export async function deleteSanction(idSanction: number): Promise<void> {
  const res = await authFetch(`${API}/sanctions/${idSanction}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erreur suppression sanction');
}

export async function notifierParents(idSanction: number): Promise<void> {
  const res = await authFetch(`${API}/sanctions/${idSanction}/notifier-parents`, { method: 'POST' });
  if (!res.ok) throw new Error('Erreur notification');
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export async function getDisciplineStats(from?: string, to?: string): Promise<DisciplineStats> {
  const params = new URLSearchParams();
  if (from) params.append('from', from);
  if (to)   params.append('to', to);
  const res = await authFetch(`${API}/discipline/stats?${params}`);
  if (!res.ok) throw new Error('Erreur stats');
  return res.json();
}