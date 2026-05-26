const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

// ─── Types ───────────────────────────────────────────────────

export interface Paiement {
  idPaie: number;
  matricule: number;
  idAca: number;
  montant: number;
  url: string;
  comentaire: string;
  idMode: number;
  operation_ID: string;
  idPers: number;
  datePaie: string;
  dateEnregistrer: string;
  eleve?: { matricule: number; nom: string; prenom: string };
  mode?: { idMode: number; libelle: string };
  annee_academique?: { idAnnee: number; libelle: string };
}

export interface PaiementPaginate {
  data: Paiement[];
  total: number;
  last_page: number;
  current_page: number;
}

export interface PaiementFilters {
  page?: number;
  search?: string;
  matricule?: string;
  idAca?: string;
  idMode?: string;
}

export interface Mode {
  idMode: number;
  libelle: string;
  information: string;
  actif: number;
}

export interface Scolarite {
  idScolarite: number;
  inscription: number;
  pension: number;
  nbreTranche: number;
  description: string;
  idCycle: number;
  cycle?: { idCycle: number; libelle: string };
  tranches?: Tranche[];
}

export interface Tranche {
  idTranche: number;
  libelle: string;
  montant: number;
  delai_mois: string;
  delai_jour: string;
  idScolarite: number;
  actif: number;
}

export interface SuiviEleve {
  matricule: number;
  paiements: Paiement[];
  totalPaye: number;
  montantTotal: number;
  resteAPayer: number;
  tauxRecouvrement: number;
  scolarite: Scolarite | null;
  tranches: Tranche[];
}

export interface DashboardPaiement {
  totalCollecte: number;
  nbPaiements: number;
  nbElevesPayes: number;
  nbDebiteurs: number;
  parMode: { idMode: number; total: number; nb: number; mode?: Mode }[];
  recents: Paiement[];
}

export interface AnneeAcademique {
  idAnnee: number;
  libelle: string;
  periode: string;
}

// Stats globales paiements
export interface StatsPaiement {
  parClasse: {
    idClasse: number;
    libelle: string;
    nbEleves: number;
    totalCollecte: number;
    totalAttendu: number;
    tauxRecouvrement: number;
  }[];
  parMode: {
    idMode: number;
    libelle: string;
    total: number;
    nb: number;
  }[];
  parMois: {
    mois: string;
    total: number;
    nb: number;
  }[];
  totalCollecte: number;
  totalAttendu: number;
  tauxGlobal: number;
  nbElevesPayes: number;
  nbDebiteurs: number;
}

export async function getStats(idAca: number | string): Promise<StatsPaiement> {
  const res = await fetch(`${API}/paiements/stats?idAca=${idAca}`, {
    headers: authHeaders(),
  });
  return handleResponse<StatsPaiement>(res);
}

export async function getPaiementsParClasse(
  idClasse: number | string,
  idAca: number | string
): Promise<{
  classe: { idClasse: number; libelle: string };
  eleves: {
    matricule: number;
    nom: string;
    prenom: string;
    totalPaye: number;
    montantAttendu: number;
    resteAPayer: number;
    tauxRecouvrement: number;
    nbPaiements: number;
  }[];
  totalCollecte: number;
  totalAttendu: number;
  tauxRecouvrement: number;
}> {
  const res = await fetch(
    `${API}/paiements/par-classe?idClasse=${idClasse}&idAca=${idAca}`,
    { headers: authHeaders() }
  );
  return handleResponse(res);
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

// ─── Paiements ───────────────────────────────────────────────

export async function getPaiements(
  filters: PaiementFilters = {}
): Promise<PaiementPaginate> {
  const params = new URLSearchParams();
  if (filters.page)      params.append('page',      String(filters.page));
  if (filters.search)    params.append('search',    filters.search);
  if (filters.matricule) params.append('matricule', filters.matricule);
  if (filters.idAca)     params.append('idAca',     filters.idAca);
  if (filters.idMode)    params.append('idMode',    filters.idMode);

  const res = await fetch(`${API}/paiements?${params}`, {
    headers: authHeaders(),
  });
  return handleResponse<PaiementPaginate>(res);
}

export async function getPaiement(id: number): Promise<Paiement> {
  const res = await fetch(`${API}/paiements/${id}`, {
    headers: authHeaders(),
  });
  return handleResponse<Paiement>(res);
}

export async function createPaiement(payload: {
  matricule: number | string;
  idAca: number | string;
  montant: number | string;
  idMode: number | string;
  datePaie: string;
  idPers: number | string;
  operation_ID?: string;
  comentaire?: string;
}): Promise<{ message: string; paiement: Paiement }> {
  const res = await fetch(`${API}/paiements`, {
    method: 'POST',
    headers: authJsonHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updatePaiement(
  id: number,
  payload: {
    montant?: number;
    idMode?: number;
    datePaie?: string;
    comentaire?: string;
    operation_ID?: string;
  }
): Promise<{ message: string; paiement: Paiement }> {
  const res = await fetch(`${API}/paiements/${id}`, {
    method: 'PUT',
    headers: authJsonHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deletePaiement(id: number): Promise<{ message: string }> {
  const res = await fetch(`${API}/paiements/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function getSuiviEleve(
  matricule: number | string,
  idAca: number | string
): Promise<SuiviEleve> {
  const res = await fetch(
    `${API}/paiements/suivi/${matricule}?idAca=${idAca}`,
    { headers: authHeaders() }
  );
  return handleResponse<SuiviEleve>(res);
}

export async function getDashboard(
  idAca: number | string
): Promise<DashboardPaiement> {
  const res = await fetch(`${API}/paiements/dashboard?idAca=${idAca}`, {
    headers: authHeaders(),
  });
  return handleResponse<DashboardPaiement>(res);
}

// ─── Scolarités ──────────────────────────────────────────────

export async function getScolarites(): Promise<Scolarite[]> {
  const res = await fetch(`${API}/scolarites`, { headers: authHeaders() });
  return handleResponse<Scolarite[]>(res);
}

export async function getScolarite(id: number): Promise<Scolarite> {
  const res = await fetch(`${API}/scolarites/${id}`, { headers: authHeaders() });
  return handleResponse<Scolarite>(res);
}

export async function createScolarite(payload: {
  inscription: number | string;
  pension: number | string;
  nbreTranche: number | string;
  description?: string;
  idCycle: number | string;
  idFondateur: number | string;
}): Promise<{ message: string; scolarite: Scolarite }> {
  const res = await fetch(`${API}/scolarites`, {
    method: 'POST',
    headers: authJsonHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateScolarite(
  id: number,
  payload: {
    inscription?: number;
    pension?: number;
    nbreTranche?: number;
    description?: string;
  }
): Promise<{ message: string; scolarite: Scolarite }> {
  const res = await fetch(`${API}/scolarites/${id}`, {
    method: 'PUT',
    headers: authJsonHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function addTranche(
  idScolarite: number,
  payload: {
    libelle: string;
    montant: number | string;
    delai_mois: string;
    delai_jour: string;
    idFondateur: number | string;
  }
): Promise<{ message: string; tranche: Tranche }> {
  const res = await fetch(`${API}/scolarites/${idScolarite}/tranches`, {
    method: 'POST',
    headers: authJsonHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteTranche(
  idTranche: number
): Promise<{ message: string }> {
  const res = await fetch(`${API}/scolarites/tranches/${idTranche}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// ─── Modes ───────────────────────────────────────────────────

export async function getModes(): Promise<Mode[]> {
  const res = await fetch(`${API}/modes`, { headers: authHeaders() });
  return handleResponse<Mode[]>(res);
}

export async function createMode(payload: {
  libelle: string;
  information?: string;
  idFondateur: number | string;
}): Promise<{ message: string; mode: Mode }> {
  const res = await fetch(`${API}/modes`, {
    method: 'POST',
    headers: authJsonHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateMode(
  id: number,
  payload: { libelle?: string; information?: string; actif?: number }
): Promise<{ message: string; mode: Mode }> {
  const res = await fetch(`${API}/modes/${id}`, {
    method: 'PUT',
    headers: authJsonHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteMode(id: number): Promise<{ message: string }> {
  const res = await fetch(`${API}/modes/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
}

// ─── Données annexes ─────────────────────────────────────────

export async function getAnnees(): Promise<AnneeAcademique[]> {
  const res = await fetch(`${API}/annees`, { headers: authHeaders() });
  return handleResponse<AnneeAcademique[]>(res);
}

export function formatMontant(montant: number): string {
  return new Intl.NumberFormat('fr-FR').format(montant) + ' FCFA';
}

export function getStatutPaiement(
  totalPaye: number,
  montantTotal: number
): { label: string; color: string } {
  if (montantTotal === 0) return { label: 'Non défini', color: 'text-muted-foreground' };
  const taux = (totalPaye / montantTotal) * 100;
  if (taux >= 100) return { label: 'Soldé', color: 'text-green-500' };
  if (taux >= 50)  return { label: 'Partiel', color: 'text-yellow-500' };
  if (taux > 0)    return { label: 'Insuffisant', color: 'text-orange-500' };
  return { label: 'Non payé', color: 'text-red-500' };
}
