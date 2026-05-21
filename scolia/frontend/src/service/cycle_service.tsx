import { authFetch } from "./auth";

const API =
  import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

/* ================= TYPES ================= */

export interface Cycle {
  idCycle: number;
  libelle: string;
  description?: string;
  classes?: any[];
}

/* ================= GET ALL ================= */

export async function getCycles(): Promise<Cycle[]> {
  const res = await authFetch(`${API}/cycles`);

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Erreur chargement cycles");
  }

  return Array.isArray(data) ? data : data.data ?? [];
}

/* ================= GET ONE ================= */

export async function getCycle(id: number): Promise<Cycle> {
  const res = await authFetch(`${API}/cycles/${id}`);

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Erreur chargement cycle");
  }

  return data;
}

/* ================= CREATE ================= */

export async function createCycle(payload: {
  libelle: string;
  description?: string;
  idAdmin?: string;
}) {
  const res = await authFetch(`${API}/cycles`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Erreur création cycle");
  }

  return data;
}

/* ================= UPDATE ================= */

export async function updateCycle(
  id: number,
  payload: {
    libelle: string;
    description?: string;
    idAdmin?: string;
  }
) {
  const res = await authFetch(`${API}/cycles/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Erreur modification cycle");
  }

  return data;
}

/* ================= DELETE ================= */

export async function deleteCycle(id: number) {
  const res = await authFetch(`${API}/cycles/${id}`, {
    method: "DELETE",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Erreur suppression cycle");
  }

  return data;
}