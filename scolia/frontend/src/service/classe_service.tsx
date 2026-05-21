import { authFetch } from "./auth";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

/* ================= TYPES ================= */

export interface Cycle {
  idCycle: number;
  libelle: string;
}

export interface Classe {
  idClasse: number;
  libelle: string;
  idCycle: number;
  cours_count?: number;
  cycle?: Cycle;
}

export interface ClassePaginated {
  data: Classe[];
  current_page: number;
  last_page: number;
  total: number;
}

/* ================= GET ALL ================= */

export async function getClasses(
  page = 1,
  idCycle = "",
  search = ""
): Promise<ClassePaginated> {
  const params = new URLSearchParams({
    page: String(page),
  });

  if (idCycle) params.append("idCycle", idCycle);
  if (search) params.append("search", search);

  const res = await authFetch(
    `${API}/classes?${params.toString()}`
  );

  if (!res.ok) {
    throw new Error("Erreur chargement classes");
  }

  return res.json();
}

/* ================= DETAILS ================= */

export async function getClasse(id: number): Promise<Classe> {
  const res = await authFetch(`${API}/classes/${id}`);

  if (!res.ok) {
    throw new Error("Erreur chargement classe");
  }

  return res.json();
}

/* ================= CREATE ================= */

export async function createClasse(data: any) {
  const res = await authFetch(`${API}/classes`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Erreur création");
  }

  return json;
}

/* ================= UPDATE ================= */

export async function updateClasse(id: number, data: any) {
  const res = await authFetch(`${API}/classes/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Erreur modification");
  }

  return json;
}

/* ================= DELETE ================= */

export async function deleteClasse(id: number) {
  const res = await authFetch(`${API}/classes/${id}`, {
    method: "DELETE",
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "Erreur suppression");
  }

  return json;
}

/* ================= CYCLES ================= */

export async function getCycles(): Promise<Cycle[]> {
  const res = await authFetch(`${API}/cycles`);

  if (!res.ok) {
    throw new Error("Erreur chargement cycles");
  }

  return res.json();
}