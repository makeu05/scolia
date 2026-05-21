import { authFetch } from "./auth";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

/* ================= TYPES ================= */

export interface Trimestre {
  idTrimes: number;
  libelle: string;
  periode: string;
}

export interface AnneeAcademique {
  idAnnee: number;
  libelle: string;
  periode: string;
  trimestres: Trimestre[];
}

/* ================= API ================= */

export async function getAnnees(): Promise<AnneeAcademique[]> {
  const res = await authFetch(`${API}/annees`);
  if (!res.ok) throw new Error("Erreur chargement années");
  return res.json();
}

export async function createAnnee(data: {
  libelle: string;
  periode: string;
  idAdmin: string;
}) {
  const res = await authFetch(`${API}/annees`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Erreur création année");
  return json;
}

export async function deleteAnnee(idAnnee: number) {
  const res = await authFetch(`${API}/annees/${idAnnee}`, {
    method: "DELETE",
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Erreur suppression année");
  return json;
}

/* ================= TRIMESTRES ================= */

export async function createTrimestre(data: {
  libelle: string;
  periode: string;
  idAca: string;
  idAdmin: string;
}) {
  const res = await authFetch(`${API}/trimestres`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Erreur création trimestre");
  return json;
}

export async function deleteTrimestre(idTrimes: number) {
  const res = await authFetch(`${API}/trimestres/${idTrimes}`, {
    method: "DELETE",
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Erreur suppression trimestre");
  return json;
}