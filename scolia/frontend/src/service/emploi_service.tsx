import { getToken } from './auth';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

// ─── Types ───────────────────────────────────────────────────

export interface Creneau {
  idTemps:  number;
  jour:     string;
  heure:    string;
  idClasse: number;
  idCours:  number;
  idAdmin:  number;
  cours?: {
    idCours:  number;
    libelle:  string;
    enseignant?: { personne?: { nom: string; prenom: string } };
  };
  classe?: { idClasse: number; libelle: string };
}

export interface CreneauPayload {
  jour:     string;
  heure:    string;
  idClasse: number;
  idCours:  number;
  idAdmin:  number;
}

export const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'] as const;
export const HEURES = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00'] as const;

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

// ─── Fonctions ───────────────────────────────────────────────

export async function getCreneauxParClasse(idClasse: number): Promise<Creneau[]> {
  const res = await fetch(`${API}/emplois-du-temps/classe/${idClasse}`, {
    headers: authJsonHeaders(),
  });
  return handleResponse<Creneau[]>(res);
}

export async function getAllCreneaux(idClasse?: number): Promise<Creneau[]> {
  const params = new URLSearchParams();
  if (idClasse) params.append('idClasse', String(idClasse));

  const res = await fetch(`${API}/emplois-du-temps?${params}`, {
    headers: authJsonHeaders(),
  });
  return handleResponse<Creneau[]>(res);
}

export async function createCreneau(
  payload: CreneauPayload
): Promise<{ message: string; creneau: Creneau }> {
  const res = await fetch(`${API}/emplois-du-temps`, {
    method:  'POST',
    headers: authJsonHeaders(),
    body:    JSON.stringify({ idTemps: Date.now(), ...payload }),
  });
  return handleResponse(res);
}

export async function updateCreneau(
  id: number,
  payload: Partial<CreneauPayload>
): Promise<{ message: string; creneau: Creneau }> {
  const res = await fetch(`${API}/emplois-du-temps/${id}`, {
    method:  'PUT',
    headers: authJsonHeaders(),
    body:    JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteCreneau(id: number): Promise<{ message: string }> {
  const res = await fetch(`${API}/emplois-du-temps/${id}`, {
    method:  'DELETE',
    headers: authJsonHeaders(),
  });
  return handleResponse(res);
}

// ─── Helper grille ───────────────────────────────────────────
/** Transforme une liste de créneaux en grille [jour][heure] */
export function buildGrille(creneaux: Creneau[]): Record<string, Record<string, Creneau | undefined>> {
  const grille: Record<string, Record<string, Creneau | undefined>> = {};
  for (const jour of JOURS) {
    grille[jour] = {};
    for (const heure of HEURES) {
      grille[jour][heure] = creneaux.find(c => c.jour === jour && c.heure === heure);
    }
  }
  return grille;
}
