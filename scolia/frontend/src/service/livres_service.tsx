import { authFetch } from "./auth";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

/* ================= TYPES ================= */

export interface Specialite {
  idSpecialite: number;
  libelle: string;
  idAdmin?: number;
}

export interface Livre {
  idLivre: number;
  titre: string;
  auteurs: string;
  prix: number;
  edition: string;
  annee_parution: string;
  idSpecialite: number;
  idAdmin?: number;
  specialite?: Specialite;
}

/* ================= HELPERS ================= */

function getHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || `Erreur HTTP ${res.status}`);
  }
  return json.data as T;
}

/* ================= LIVRES ================= */

export async function getLivres(): Promise<Livre[]> {
  const res = await authFetch(`${API}/livres`, {
    headers: getHeaders(),
  });
  return handleResponse<Livre[]>(res);
}

export async function getLivre(id: number): Promise<Livre> {
  const res = await authFetch(`${API}/livres/${id}`, {
    headers: getHeaders(),
  });
  return handleResponse<Livre>(res);
}

export async function createLivre(data: Partial<Livre>): Promise<Livre> {
  const res = await authFetch(`${API}/livres`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<Livre>(res);
}

export async function updateLivre(
  id: number,
  data: Partial<Livre>
): Promise<Livre> {
  const res = await authFetch(`${API}/livres/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<Livre>(res);
}

export async function deleteLivre(id: number): Promise<void> {
  const res = await authFetch(`${API}/livres/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  await handleResponse<null>(res);
}

/* ================= SPECIALITES ================= */

export async function getSpecialites(): Promise<Specialite[]> {
  const res = await authFetch(`${API}/specialites`, {
    headers: getHeaders(),
  });
  return handleResponse<Specialite[]>(res);
}

export async function getSpecialite(id: number): Promise<Specialite> {
  const res = await authFetch(`${API}/specialites/${id}`, {
    headers: getHeaders(),
  });
  return handleResponse<Specialite>(res);
}

export async function createSpecialite(
  data: Partial<Specialite>
): Promise<Specialite> {
  const res = await authFetch(`${API}/specialites`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<Specialite>(res);
}

export async function updateSpecialite(
  id: number,
  data: Partial<Specialite>
): Promise<Specialite> {
  const res = await authFetch(`${API}/specialites/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<Specialite>(res);
}

export async function deleteSpecialite(id: number): Promise<void> {
  const res = await authFetch(`${API}/specialites/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  await handleResponse<null>(res);
}