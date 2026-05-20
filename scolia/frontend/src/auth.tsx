const API = 'http://localhost:8000/api';

// ─── Types ───────────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface VilleNaissance {
  idVille: number;
  libelle: string;
  actif: number;
}

let villesCache: VilleNaissance[] | null = null;

// ─── Login ───────────────────────────────────────────────
export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message ?? 'Identifiants invalides');
  }

  if (typeof window !== 'undefined') {
    if (data.token) localStorage.setItem('token', data.token);
    if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
  }

  return data;
}

// ─── Register ────────────────────────────────────────────
export async function register(
  name: string,
  email: string,
  password: string,
  role: string
): Promise<AuthResponse> {
  const res = await fetch(`${API}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message ?? 'Erreur lors de la création du compte');
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  return data;
}

// ─── Logout ──────────────────────────────────────────────
export async function logout(): Promise<void> {
  const token = getToken();

  try {
    if (token) {
      await fetch(`${API}/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } catch (e) {
    console.warn('Logout API error ignored');
  }

  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

// ─── Forgot password ─────────────────────────────────────
export async function forgotPassword(email: string): Promise<void> {
  const res = await fetch(`${API}/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message ?? "Erreur lors de l'envoi");
  }
}

// ─── Helpers ─────────────────────────────────────────────
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null;

  const raw = localStorage.getItem('user');
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// ─── Auth Fetch ──────────────────────────────────────────
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

// ─── Villes ─────────────────────────────────────────────
export async function getVilles(): Promise<VilleNaissance[]> {
  if (villesCache) return villesCache;

  const res = await authFetch(`${API}/villes`);

  if (!res.ok) {
    throw new Error('Erreur lors du chargement des villes');
  }

  villesCache = await res.json();
  return villesCache as VilleNaissance[];
}

import { useState } from "react";

export function useAuth() {
  const [user, setUser] = useState(getUser());

  async function loginUser(email: string, password: string) {
    const data = await login(email, password);
    setUser(data.user);
    return data;
  }

  return {
    user,
    token: getToken(),
    login: loginUser,
    isAuthenticated: !!getToken(),
  };
}