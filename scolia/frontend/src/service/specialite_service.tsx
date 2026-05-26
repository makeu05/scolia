import { authFetch } from "./auth";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

/* ================= TYPES ================= */

export interface Livre {
  idLivre: number;
  titre: string;
  auteurs: string;
  prix: number;
  edition: string;
  annee_parution: string;
  idSpecialite: number;
  idAdmin?: number;
}

export interface Specialite {
  idSpecialite: number;
  libelle: string;
  idAdmin?: number;
  livres?: Livre[]; // chargé par ->with('livres') dans index() et show()
}

export type SpecialitePayload = Pick<Specialite, "libelle" | "idAdmin">;

/* ================= HELPERS ================= */

function getHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json() as { data: T; message?: string };
  if (!res.ok) {
    throw new Error(json.message ?? `Erreur HTTP ${res.status}`);
  }
  return json.data;
}

/* ================= SPECIALITES ================= */

/* ===== GET ALL ===== */

export async function getSpecialites(): Promise<Specialite[]> {
  const res = await authFetch(`${API}/specialites`, {
    headers: getHeaders(),
  });
  return handleResponse<Specialite[]>(res);
}

/* ===== DETAILS ===== */

export async function getSpecialite(id: number): Promise<Specialite> {
  const res = await authFetch(`${API}/specialites/${id}`, {
    headers: getHeaders(),
  });
  return handleResponse<Specialite>(res);
}

/* ===== CREATE ===== */

export async function createSpecialite(
  data: SpecialitePayload
): Promise<Specialite> {
  const res = await authFetch(`${API}/specialites`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<Specialite>(res);
}

/* ===== UPDATE ===== */

export async function updateSpecialite(
  id: number,
  data: Partial<SpecialitePayload>
): Promise<Specialite> {
  const res = await authFetch(`${API}/specialites/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<Specialite>(res);
}

/* ===== DELETE ===== */

export async function deleteSpecialite(id: number): Promise<void> {
  const res = await authFetch(`${API}/specialites/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  await handleResponse<null>(res);
}