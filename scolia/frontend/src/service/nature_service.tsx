const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

// ─── Types ───────────────────────────────────────────────────

export interface Nature {
  idNature: number;
  libelle: string;
  description: string;
  epreuves_count?: number;
}

// ─── Helpers ─────────────────────────────────────────────────

function getToken(): string {
  return localStorage.getItem('token') ?? '';
}

function authHeaders(): HeadersInit {
  return { Authorization: `Bearer ${getToken()}` };
}

function authJsonHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Une erreur est survenue');
  return data as T;
}

// ─── Fonctions ───────────────────────────────────────────────

export async function getNatures(): Promise<Nature[]> {
  const res = await fetch(`${API}/natures`, { headers: authHeaders() });
  return handleResponse<Nature[]>(res);
}

export async function getNature(id: number): Promise<Nature> {
  const res = await fetch(`${API}/natures/${id}`, { headers: authHeaders() });
  return handleResponse<Nature>(res);
}

export async function createNature(payload: {
  libelle: string;
  description?: string;
}): Promise<{ message: string; nature: Nature }> {
  const res = await fetch(`${API}/natures`, {
    method: 'POST',
    headers: authJsonHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateNature(
  id: number,
  payload: { libelle?: string; description?: string }
): Promise<{ message: string; nature: Nature }> {
  const res = await fetch(`${API}/natures/${id}`, {
    method: 'PUT',
    headers: authJsonHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteNature(
  id: number
): Promise<{ message: string }> {
  const res = await fetch(`${API}/natures/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
}