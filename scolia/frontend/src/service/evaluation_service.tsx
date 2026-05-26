const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

// ─── Types ───────────────────────────────────────────────────

export interface Evaluation {
  idEval: number;
  note: number;
  appreciation: string;
  matricule: number;
  idEpreuve: number;
  idCours: number;
  idSession: number;
  eleve?: { matricule: number; nom: string; prenom: string };
  epreuve?: { libelle: string; nature?: { libelle: string } };
  cours?: { libelle: string; coefficient: number };
}

export interface NoteItem {
  matricule: number;
  note: number;
}

export interface MoyenneResultat {
  idCours: number;
  cours: string;
  coefficient: number;
  moyenne: number;
  appreciation: string;
  notes: { note: number; idEpreuve: number }[];
}

export interface MoyenneEleve {
  matricule: number;
  idTrimestre: number;
  resultats: MoyenneResultat[];
  moyenneGenerale: number;
  mention: string;
}

export interface BulletinData {
  eleve: {
    matricule: number;
    nom: string;
    prenom: string;
    dateNaissance: string;
    sexe: number;
  };
  classe: {
    libelle: string;
    annee: string;
    idClasse: number;
  };
  trimestre: {
    idTrimes: number;
    libelle: string;
    periode: string;
  };
  resultats: {
    cours: string;
    coefficient: number;
    moyenne: number;
    appreciation: string;
  }[];
  moyenneGenerale: number;
  mention: string;
  classement: { rang: number | string; total: number | string };
}

export interface ClassementItem {
  matricule: number;
  nom: string;
  prenom: string;
  moyenne: number;
  rang: number;
}

export interface AnneeAcademique {
  idAnnee: number;
  libelle: string;
  periode: string;
}

export interface Trimestre {
  idTrimes: number;
  libelle: string;
  periode: string;
  idAca: number;
}

export interface Session {
  idSession: number;
  libelle: string;
  idTrimestre: number;
  trimestre?: { libelle: string };
}

export interface Classe {
  idClasse: number;
  libelle: string;
}

export interface Cours {
  idCours: number;
  libelle: string;
  coefficient: number;
}

export interface Epreuve {
  idEpreuve: number;
  libelle: string;
  nature?: { libelle: string };
}

export interface EleveSimple {
  matricule: number;
  nom: string;
  prenom: string;
  sexe: number;
  salle: string;
}

// ─── Helpers ─────────────────────────────────────────────────

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

// ─── Évaluations ─────────────────────────────────────────────

export async function getEvaluations(
  idCours: number | string,
  idSession: number | string
): Promise<Evaluation[]> {
  const res = await fetch(
    `${API}/evaluations?idCours=${idCours}&idSession=${idSession}`,
    { headers: authHeaders() }
  );
  return handleResponse<Evaluation[]>(res);
}

export async function storeBulk(payload: {
  idCours: number | string;
  idSession: number | string;
  idEpreuve: number | string;
  idPers: number | string;
  notes: NoteItem[];
}): Promise<{ message: string }> {
  const res = await fetch(`${API}/evaluations/bulk`, {
    method: 'POST',
    headers: authJsonHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateEvaluation(
  id: number,
  payload: { note: number; appreciation?: string }
): Promise<{ message: string; evaluation: Evaluation }> {
  const res = await fetch(`${API}/evaluations/${id}`, {
    method: 'PUT',
    headers: authJsonHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteEvaluation(
  id: number
): Promise<{ message: string }> {
  const res = await fetch(`${API}/evaluations/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// ─── Moyennes & Bulletins ─────────────────────────────────────

export async function getMoyenneEleve(
  matricule: number | string,
  idTrimestre: number | string
): Promise<MoyenneEleve> {
  const res = await fetch(
    `${API}/evaluations/moyenne/${matricule}?idTrimestre=${idTrimestre}`,
    { headers: authHeaders() }
  );
  return handleResponse<MoyenneEleve>(res);
}

export async function getBulletin(
  matricule: number | string,
  idTrimestre: number | string
): Promise<BulletinData> {
  const res = await fetch(
    `${API}/evaluations/bulletin/${matricule}?idTrimestre=${idTrimestre}`,
    { headers: authHeaders() }
  );
  return handleResponse<BulletinData>(res);
}

export async function getClassement(
  idClasse: number | string,
  idTrimestre: number | string
): Promise<ClassementItem[]> {
  const res = await fetch(
    `${API}/evaluations/classement?idClasse=${idClasse}&idTrimestre=${idTrimestre}`,
    { headers: authHeaders() }
  );
  return handleResponse<ClassementItem[]>(res);
}

// ─── Données annexes ─────────────────────────────────────────

export async function getAnnees(): Promise<AnneeAcademique[]> {
  const res = await fetch(`${API}/annees`, { headers: authHeaders() });
  return handleResponse<AnneeAcademique[]>(res);
}

export async function getTrimestres(idAca: number | string): Promise<Trimestre[]> {
  const res = await fetch(`${API}/trimestres?idAca=${idAca}`, {
    headers: authHeaders(),
  });
  return handleResponse<Trimestre[]>(res);
}

export async function getSessions(idTrimestre: number | string): Promise<Session[]> {
  const res = await fetch(`${API}/sessions?idTrimestre=${idTrimestre}`, {
    headers: authHeaders(),
  });
  return handleResponse<Session[]>(res);
}

export async function getClasses(): Promise<Classe[]> {
  const res = await fetch(`${API}/classes`, { headers: authHeaders() });
  const data = await handleResponse<any>(res);
  return data.data ?? data;
}

export async function getCoursByClasse(idClasse: number | string): Promise<Cours[]> {
  const res = await fetch(`${API}/cours?idClasse=${idClasse}&actif=1`, {
    headers: authHeaders(),
  });
  const data = await handleResponse<any>(res);
  return data.data ?? data;
}

export async function getEpreuves(): Promise<Epreuve[]> {
  const res = await fetch(`${API}/epreuves`, { headers: authHeaders() });
  const data = await handleResponse<any>(res);
  return data.data ?? data;
}

export async function getElevesByClasse(
  idClasse: number | string,
  idAcademi: number | string
): Promise<EleveSimple[]> {
  const res = await fetch(
    `${API}/inscriptions/eleves-classe?idClasse=${idClasse}&idAcademi=${idAcademi}`,
    { headers: authHeaders() }
  );
  return handleResponse<EleveSimple[]>(res);
}

// ─── Helpers locaux ───────────────────────────────────────────

export function getAppreciation(note: number): string {
  if (note >= 18) return 'Excellent';
  if (note >= 16) return 'Très bien';
  if (note >= 14) return 'Bien';
  if (note >= 12) return 'Assez bien';
  if (note >= 10) return 'Passable';
  if (note >= 8)  return 'Insuffisant';
  return 'Très insuffisant';
}

export function getAppreciationColor(appr: string): string {
  const map: Record<string, string> = {
    'Excellent':        'text-green-500',
    'Très bien':        'text-green-400',
    'Bien':             'text-blue-400',
    'Assez bien':       'text-blue-300',
    'Passable':         'text-yellow-400',
    'Insuffisant':      'text-orange-400',
    'Très insuffisant': 'text-red-400',
  };
  return map[appr] ?? 'text-muted-foreground';
}

export function getMention(moyenne: number): string {
  if (moyenne >= 16) return 'Félicitations du jury';
  if (moyenne >= 14) return 'Compliments du jury';
  if (moyenne >= 12) return 'Encouragements du jury';
  if (moyenne >= 10) return 'Passable';
  return 'Avertissement';
}