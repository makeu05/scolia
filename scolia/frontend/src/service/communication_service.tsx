import { getToken } from './auth';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

// ─── Types ───────────────────────────────────────────────────

export interface Message {
  idMessages:   number;
  idExp_Pers:   number;
  idParent:     number;
  objet:        string;
  information:  string;
  type_message: 0 | 1 | 2;
  AnneeAcade:   string;
  valider:      boolean;
  created_at?:  string;
  parent?: {
    idParent: number;
    personne?: { nom: string; prenom: string };
    eleve?:   { nom: string; prenom: string };
  };
}

export interface MessagePayload {
  idExp_Pers:   number;
  idParent:     number;
  objet:        string;
  information:  string;
  type_message: 0 | 1 | 2;
  AnneeAcade:   string;
}

export interface DiffusionPayload {
  idExp_Pers:   number;
  objet:        string;
  information:  string;
  type_message: 1 | 2;
  AnneeAcade:   string;
}

export interface MessagePaginate {
  data:         Message[];
  total:        number;
  last_page:    number;
  current_page: number;
}

export const TYPE_LABELS: Record<number, string> = {
  0: 'Individuel',
  1: 'Diffusion générale',
  2: 'Rappel paiement',
};

export const TYPE_COLORS: Record<number, string> = {
  0: 'text-blue-700 bg-blue-100',
  1: 'text-green-700 bg-green-100',
  2: 'text-amber-700 bg-amber-100',
};

// ─── Helpers ─────────────────────────────────────────────────

function authJsonHeaders(): HeadersInit {
  return {
    Authorization:  `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Une erreur est survenue');
  return data as T;
}

// ─── Fonctions ───────────────────────────────────────────────

export async function getMessages(typeMessage?: number): Promise<MessagePaginate> {
  const params = new URLSearchParams();
  if (typeMessage !== undefined) params.append('type_message', String(typeMessage));

  const res = await fetch(`${API}/messages?${params}`, {
    headers: authJsonHeaders(),
  });
  return handleResponse<MessagePaginate>(res);
}

export async function getMessage(id: number): Promise<Message> {
  const res = await fetch(`${API}/messages/${id}`, {
    headers: authJsonHeaders(),
  });
  return handleResponse<Message>(res);
}

export async function sendMessage(
  payload: MessagePayload
): Promise<{ message: string; note: string; data: Message }> {
  const res = await fetch(`${API}/messages`, {
    method:  'POST',
    headers: authJsonHeaders(),
    body:    JSON.stringify({ idMessages: Date.now(), ...payload }),
  });
  return handleResponse(res);
}

export async function sendDiffusion(
  payload: DiffusionPayload
): Promise<{ message: string; note: string; destinataires: number }> {
  const res = await fetch(`${API}/messages/diffusion`, {
    method:  'POST',
    headers: authJsonHeaders(),
    body:    JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function validerMessage(id: number): Promise<{ message: string }> {
  const res = await fetch(`${API}/messages/${id}/valider`, {
    method:  'PATCH',
    headers: authJsonHeaders(),
  });
  return handleResponse(res);
}
