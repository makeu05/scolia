// src/service/titulaire_service.ts

import { authFetch } from './auth';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Titulaire {
  idTitulaire: number;
  idPers: number;
  idSalle: number;
  actif: boolean;
  created_at: string;
  personne?: {
    idPers: number;
    nom: string;
    prenom: string;
    mobile: string;
  };
  salle?: {
    idSalle: number;
    libelle: string;
    classe?: { idClasse: number; libelle: string };
  };
}

export interface EnseignantDisponibleTitulaire {
  idPers: number;
  nom: string;
  prenom: string;
  mobile: string;
  titulaire: boolean; // true = déjà titulaire de cette salle
}

// ── Fonctions ─────────────────────────────────────────────────────────────────

/** Titulaire actif d'une salle */
export async function getTitulaireParSalle(idSalle: number | string): Promise<Titulaire | null> {
  const res = await authFetch(`${API}/salles/${idSalle}/titulaire`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Erreur chargement titulaire');
  return res.json();
}

/** Enseignants disponibles pour une salle */
export async function getEnseignantsDisponiblesTitulaire(
  idSalle: number | string
): Promise<EnseignantDisponibleTitulaire[]> {
  const res = await authFetch(`${API}/salles/${idSalle}/enseignants-disponibles`);
  if (!res.ok) throw new Error('Erreur chargement enseignants');
  return res.json();
}

/** Affecter un titulaire */
export async function affecterTitulaire(
  idSalle: number | string,
  idPers: number,
  idAdmin: number
): Promise<Titulaire> {
  const res = await authFetch(`${API}/titulaires`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idSalle: Number(idSalle), idPers, idAdmin }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Erreur lors de l'affectation");
  return data.titulaire;
}

/** Désaffecter le titulaire d'une salle */
export async function desaffecterTitulaire(idSalle: number | string): Promise<void> {
  const res = await authFetch(`${API}/salles/${idSalle}/desaffecter`, {
    method: 'POST',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Erreur désaffectation');
  }
}

/** Historique des titulaires d'une salle */
export async function getHistoriqueTitulaire(idSalle: number | string): Promise<Titulaire[]> {
  const res = await authFetch(`${API}/salles/${idSalle}/titulaire/historique`);
  if (!res.ok) throw new Error('Erreur historique');
  return res.json();
}

/** Liste de tous les titulaires (dashboard) */
export async function getAllTitulaires(filters?: { actif?: string }): Promise<Titulaire[]> {
  const params = new URLSearchParams();
  if (filters?.actif !== undefined) params.append('actif', filters.actif);
  const res = await authFetch(`${API}/titulaires?${params}`);
  if (!res.ok) throw new Error('Erreur chargement titulaires');
  return res.json();
}