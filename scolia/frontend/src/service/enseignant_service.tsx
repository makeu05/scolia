// src/service/enseignant_service.ts
const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

import { authFetch } from "./auth";

/* ================= TYPES ================= */

export interface Personne {
  nom: string;
  prenom: string;
  mobile: string;
  phone?: string;
  dateNaissance?: string;
  lieuNaissance?: string;
  username: string;
}

export interface Enseignant {
  idEnseignant: number;
  Actif: number;
  idCours?: number;
  idAdmin: number;

  personne: Personne;

  cours?: {
    libelle: string;
    classe?: {
      libelle: string;
    };
  };
}

export interface EnseignantPaginate {
  data: Enseignant[];
  total: number;
  last_page: number;
  current_page: number;
}

export interface EnseignantFilters {
  page?: number;
  search?: string;
  actif?: string;
}

/* ================= GET ALL ================= */

export async function getEnseignants(
  filters: EnseignantFilters = {}
): Promise<EnseignantPaginate> {
  const params = new URLSearchParams();

  if (filters.page) params.append("page", String(filters.page));
  if (filters.search) params.append("search", filters.search);
  if (filters.actif !== undefined) params.append("actif", filters.actif);

  const res = await authFetch(`${API}/enseignants?${params}`);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Erreur lors du chargement des enseignants");
  }

  return await res.json();
}

/* ================= GET ONE ================= */

export async function getEnseignant(
  idEnseignant: number | string
): Promise<Enseignant> {
  const res = await authFetch(`${API}/enseignants/${idEnseignant}`);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Erreur lors du chargement de l'enseignant");
  }

  return await res.json();
}

/* ================= CREATE ================= */

export async function createEnseignant(payload: any) {
  const res = await authFetch(`${API}/enseignants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Erreur lors de la création");
  }

  return await res.json();
}

/* ================= UPDATE ================= */

export async function updateEnseignant(
  idEnseignant: number | string,
  payload: any
) {
  const res = await authFetch(`${API}/enseignants/${idEnseignant}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Erreur lors de la modification");
  }

  return await res.json();
}

/* ================= DESACTIVER ================= */

export async function desactiverEnseignant(id: number) {
  const res = await authFetch(`${API}/enseignants/${id}/desactiver`, {
    method: "PATCH",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Erreur lors de la désactivation");
  }

  return await res.json();
}

/* ================= REACTIVER ================= */

export async function reactiverEnseignant(id: number) {
  const res = await authFetch(`${API}/enseignants/${id}/reactiver`, {
    method: "PATCH",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Erreur lors de la réactivation");
  }

  return await res.json();
}

/* ================= DELETE ================= */

export async function deleteEnseignant(id: number) {
  const res = await authFetch(`${API}/enseignants/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Erreur lors de la suppression");
  }

  return await res.json();
}