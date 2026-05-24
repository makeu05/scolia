// src/service/fiche_enseignant_service.ts
const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

import { authFetch } from "./auth";

/* ================= TYPES ================= */

export interface FicheEnseignant {
  idRap: number;
  idEnseignant: number;
  libelle: string;
  points?: number;
  idAdministratif: number;
  idAca: number;
  commentaire?: string;
  event_date: string;

  enseignant?: {
    idEnseignant: number;
    personne?: {
      nom: string;
      prenom: string;
      mobile: string;
    };
  };

  anneeAcademique?: {
    idAnnee: number;
    libelle: string;
  };
}

export interface FicheFilters {
  page?: number;
  search?: string;
  idEnseignant?: number | string;
  idAca?: number | string;
}

/* ================= GET ALL ================= */

export async function getFichesEnseignant(filters: FicheFilters = {}) {
  const params = new URLSearchParams();

  if (filters.page) params.append("page", String(filters.page));
  if (filters.search) params.append("search", filters.search);
  if (filters.idEnseignant) params.append("idEnseignant", String(filters.idEnseignant));
  if (filters.idAca) params.append("idAca", String(filters.idAca));

  const res = await authFetch(`${API}/fiches-enseignant?${params}`);

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Erreur lors du chargement des fiches");
  }

  return await res.json();
}

/* ================= GET ONE ================= */

export async function getFicheEnseignant(id: number | string): Promise<FicheEnseignant> {
  const res = await authFetch(`${API}/fiches-enseignant/${id}`);

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Erreur lors du chargement de la fiche");
  }

  return await res.json();
}

/* ================= CREATE ================= */

export async function createFicheEnseignant(payload: any) {
  const res = await authFetch(`${API}/fiches-enseignant`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Erreur lors de la création de la fiche");
  }

  return await res.json();
}

/* ================= UPDATE ================= */

export async function updateFicheEnseignant(id: number | string, payload: any) {
  const res = await authFetch(`${API}/fiches-enseignant/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Erreur lors de la modification");
  }

  return await res.json();
}

/* ================= DELETE ================= */

export async function deleteFicheEnseignant(id: number | string) {
  const res = await authFetch(`${API}/fiches-enseignant/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Erreur lors de la suppression");
  }

  return await res.json();
}

/* ================= GET FICHES BY ENSEIGNANT ================= */

export async function getFichesByEnseignant(idEnseignant: number | string) {
  const res = await authFetch(`${API}/enseignants/${idEnseignant}/fiches`);

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Erreur lors du chargement des fiches");
  }

  return await res.json();
}

export async function searchEnseignants(search: string) {
  const res = await authFetch(`${API}/enseignants/search?search=${search}`);

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Erreur recherche enseignants");
  }

  return await res.json();
}

