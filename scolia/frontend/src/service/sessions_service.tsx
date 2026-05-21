import { authFetch } from "./auth";

const API =
  import.meta.env.VITE_API_URL ??
  "http://localhost:8000/api";

/* ================= TYPES ================= */

export interface Trimestre {
  idTrimes: number;
  libelle: string;
}

export interface Session {
  idSession: number;
  libelle: string;
  description?: string;

  trimestre?: Trimestre & {
    annee_academique?: {
      libelle: string;
    };
  };
}

/* ================= GET ================= */

export async function getSessions(trimestreId = "") {
  const params = new URLSearchParams();

  if (trimestreId) {
    params.append("idTrimestre", trimestreId);
  }

  const res = await authFetch(
    `${API}/sessions?${params}`
  );

  const data = await res.json();
  return data;
}

/* ================= GET ONE ================= */

export async function getSession(id: number) {
  const res = await authFetch(
    `${API}/sessions/${id}`
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.message || "Erreur session"
    );
  }

  return data;
}

/* ================= CREATE ================= */

export async function createSession(form: any) {
  const res = await authFetch(
    `${API}/sessions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.message || "Erreur création"
    );
  }

  return data;
}

/* ================= UPDATE ================= */

export async function updateSession(
  id: number,
  form: any
) {
  const res = await authFetch(
    `${API}/sessions/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.message || "Erreur update"
    );
  }

  return data;
}

/* ================= DELETE ================= */

export async function deleteSession(id: number) {
  const res = await authFetch(
    `${API}/sessions/${id}`,
    { method: "DELETE" }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.message || "Erreur delete"
    );
  }

  return data;
}