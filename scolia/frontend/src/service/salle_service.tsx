import { authFetch } from "./auth";

const API =
  import.meta.env.VITE_API_URL ??
  "http://localhost:8000/api";

/* ================= TYPES ================= */

export interface Classe {
  idClasse: number;
  libelle: string;
}

export interface Salle {
  idSalle: number;
  libelle: string;
  position: string;
  surface: string;
  actif: boolean;

  idClasse?: number;

  classe?: Classe;
}

/* ================= GET SALLES ================= */

export async function getSalles(
  page = 1,
  idClasse = "",
  actif = ""
) {
  const params = new URLSearchParams({
    page: String(page),
  });

  if (idClasse) {
    params.append("idClasse", idClasse);
  }

  if (actif !== "") {
    params.append("actif", actif);
  }

  const res = await authFetch(
    `${API}/salles?${params}`
  );

  const data = await res.json();

  return data;
}

/* ================= GET ONE ================= */

export async function getSalle(id: number) {
  const res = await authFetch(
    `${API}/salles/${id}`
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.message || "Erreur chargement salle"
    );
  }

  return data;
}
/* ================= CREATE ================= */

export async function createSalle(
  payload: any
) {
  const res = await authFetch(
    `${API}/salles`,
    {
      method: "POST",

      body: JSON.stringify(payload),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.message ||
        "Erreur création salle"
    );
  }

  return data;
}

/* ================= UPDATE ================= */

export async function updateSalle(
  id: number,
  payload: any
) {
  const res = await authFetch(
    `${API}/salles/${id}`,
    {
      method: "PUT",

      body: JSON.stringify(payload),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.message ||
        "Erreur modification salle"
    );
  }

  return data;
}

/* ================= DELETE ================= */

export async function deleteSalle(
  id: number
) {
  const res = await authFetch(
    `${API}/salles/${id}`,
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

/* ================= CLASSES ================= */

export async function getClasses() {
  const res = await authFetch(
    `${API}/classes`
  );

  const data = await res.json();

  return data.data ?? data;
}