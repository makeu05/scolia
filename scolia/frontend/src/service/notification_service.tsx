const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

export interface Notification {
  id: number;
  type: string;
  titre: string;
  message: string;
  icone: string;
  couleur: 'blue' | 'green' | 'red' | 'yellow';
  lien: string | null;
  lue: boolean;
  created_at: string;
}

export interface NotifResponse {
  notifications: Notification[];
  nonLues: number;
}

function getToken(): string {
  return localStorage.getItem('token') ?? '';
}

function authHeaders(): HeadersInit {
  return { Authorization: `Bearer ${getToken()}` };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Erreur');
  return data as T;
}

export async function getNotifications(): Promise<NotifResponse> {
  const res = await fetch(`${API}/notifications`, { headers: authHeaders() });
  return handleResponse<NotifResponse>(res);
}

export async function pollingNotifications(depuis?: string): Promise<{
  nouvelles: Notification[];
  nb: number;
  timestamp: string;
}> {
  const params = depuis ? `?depuis=${encodeURIComponent(depuis)}` : '';
  const res = await fetch(`${API}/notifications/polling${params}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function marquerLue(id: number): Promise<void> {
  await fetch(`${API}/notifications/${id}/lue`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
}

export async function marquerToutesLues(): Promise<void> {
  await fetch(`${API}/notifications/lues/tout`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
}

export async function supprimerNotification(id: number): Promise<void> {
  await fetch(`${API}/notifications/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}

export async function supprimerLues(): Promise<void> {
  await fetch(`${API}/notifications/lues/tout`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}

export function getCouleurClasse(couleur: string): string {
  const map: Record<string, string> = {
    blue:   'bg-blue-50 border-blue-200 text-blue-700',
    green:  'bg-green-50 border-green-200 text-green-700',
    red:    'bg-red-50 border-red-200 text-red-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  };
  return map[couleur] ?? map.blue;
}

export function getTempsEcoule(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)   return "À l'instant";
  if (mins < 60)  return `Il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `Il y a ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7)   return `Il y a ${days}j`;
  return new Date(dateStr).toLocaleDateString('fr-FR');
}