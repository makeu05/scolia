import { useState } from 'react';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

export interface User {
  id: number;
  name: string;
  username: string;
  role:
    | 'root'
    | 'admin'
    | 'fondateur'
    | 'directeur'
    | 'enseignant'
    | 'parent';

  type: 'admin' | 'personne';
  typeCode: number;

  // Enseignant
  idEnseignant?: number;
  idCours?: number;

  // Parent
  enfants?: number[];
}

/* =========================================================
   TOKEN
========================================================= */

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function setToken(token: string) {
  localStorage.setItem('token', token);
}

/* =========================================================
   USER
========================================================= */

export function setUser(user: User) {
  localStorage.setItem('user', JSON.stringify(user));
}

export function getUser(): User | null {
  const data = localStorage.getItem('user');

  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/* =========================================================
   LOGOUT
========================================================= */

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

/* =========================================================
   AUTH FETCH
========================================================= */

export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {

  // IMPORTANT :
  // le token est lu AU MOMENT DE L'APPEL
  const token = getToken();

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Ne pas forcer Content-Type avec FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Injection Bearer
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

/* =========================================================
   LOGIN
========================================================= */

export async function login(
  username: string,
  password: string
): Promise<{ token: string; user: User }> {

  const res = await fetch(`${API}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message ?? 'Identifiants invalides');
  }

  // stockage
  setToken(data.token);
  setUser(data.user);

  return data;
}

/* =========================================================
   HOOK AUTH
========================================================= */

export function useAuth() {

  const [user, setUserState] = useState<User | null>(getUser());

  async function loginUser(
    username: string,
    password: string
  ) {
    const data = await login(username, password);

    setUserState(data.user);

    return data;
  }

  function logoutUser() {
    logout();
    setUserState(null);
  }

  return {

    user,

    token: getToken(),

    isAuthenticated: !!getToken(),

    login: loginUser,

    logout: logoutUser,

    // =====================================================
    // HELPERS ROLES
    // =====================================================

    isRoot:
      user?.role === 'root',

    isAdmin:
      ['root', 'admin'].includes(user?.role ?? ''),

    isDirecteur:
      ['root', 'admin', 'directeur']
        .includes(user?.role ?? ''),

    isFondateur:
      ['root', 'fondateur']
        .includes(user?.role ?? ''),

    isEnseignant:
      user?.role === 'enseignant',

    isParent:
      user?.role === 'parent',

    canManageNotes:
      ['root', 'admin', 'directeur', 'enseignant']
        .includes(user?.role ?? ''),

    canManagePaiements:
      ['root', 'admin', 'directeur', 'fondateur']
        .includes(user?.role ?? ''),
  };
}