const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

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

// ─── Login ───────────────────────────────────────────────
export async function login(email: string, password: string) {
  const res = await fetch(`${API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Identifiants invalides');
  }

  const data = await res.json();

  if (typeof window !== 'undefined') {
    if (data.token) {
      localStorage.setItem('token', data.token);
      document.cookie = `token=${data.token}; path=/;`;
    }
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user)); // ← manquait
    }
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

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Erreur lors de la création du compte');
  }

  const data: AuthResponse = await res.json();
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
}

// ─── Logout ──────────────────────────────────────────────
export async function logout(): Promise<void> {
  const token = getToken();
  if (token) {
    await fetch(`${API}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }).catch(() => {});
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}

// ─── Reset password ──────────────────────────────────────
export async function forgotPassword(email: string): Promise<void> {
  const res = await fetch(`${API}/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Erreur lors de l\'envoi');
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
  try { return JSON.parse(raw) as User; } catch { return null; }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// ─── Fetch authentifié ───────────────────────────────────
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}