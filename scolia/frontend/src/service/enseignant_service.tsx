// src/service/enseignant_service.ts

import { authFetch } from "./auth";

const API =
  import.meta.env.VITE_API_URL ??
  "http://localhost:8000/api";

/* ================= TYPES ================= */

export interface Personne {
  phone: string;
  dateNaissance: any;
  lieuNaissance: string;
  nom: string;
  prenom: string;
  mobile: string;
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

/* ================= GET ENSEIGNANTS ================= */

export async function getEnseignants(
  filters: EnseignantFilters = {}
): Promise<EnseignantPaginate> {

  const params = new URLSearchParams();

  if (filters.page) {
    params.append(
      "page",
      String(filters.page)
    );
  }

  if (filters.search) {
    params.append(
      "search",
      filters.search
    );
  }

  if (
    filters.actif !== undefined
  ) {
    params.append(
      "actif",
      filters.actif
    );
  }

  const res = await authFetch(
    `${API}/enseignants?${params}`
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.message ||
      "Erreur chargement enseignants"
    );
  }

  return data;
}

/* ================= GET ONE ================= */

export async function getEnseignant(
  idEnseignant: number | string
): Promise<Enseignant> {

  const res = await authFetch(
    `${API}/enseignants/${idEnseignant}`
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.message ||
      "Erreur chargement enseignant"
    );
  }

  return data;
}

/* ================= DESACTIVER ================= */

export async function desactiverEnseignant(
  id: number
) {

  const res = await authFetch(
    `${API}/enseignants/${id}/desactiver`,
    {
      method: "PATCH",
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.message ||
      "Erreur désactivation"
    );
  }

  return data;
}

/* ================= REACTIVER ================= */

export async function reactiverEnseignant(
  id: number
) {

  const res = await authFetch(
    `${API}/enseignants/${id}/reactiver`,
    {
      method: "PATCH",
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.message ||
      "Erreur réactivation"
    );
  }

  return data;
}

/* ================= DELETE ================= */

export async function deleteEnseignant(
  id: number
) {

  const res = await authFetch(
    `${API}/enseignants/${id}`,
    {
      method: "DELETE",
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.message ||
      "Erreur suppression"
    );
  }

  return data;
}