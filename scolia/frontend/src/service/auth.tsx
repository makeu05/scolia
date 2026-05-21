const API = "http://localhost:8000/api";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// TOKEN STORAGE
// ─────────────────────────────────────────────

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function setToken(token: string) {
  localStorage.setItem("token", token);
}

export function setUser(user: User) {
  localStorage.setItem("user", JSON.stringify(user));
}

export function getUser(): User | null {
  const data = localStorage.getItem("user");
  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

// ─────────────────────────────────────────────
// AUTH REQUESTS
// ─────────────────────────────────────────────

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message ?? "Identifiants invalides");
  }

  if (data.token) setToken(data.token);
  if (data.user) setUser(data.user);

  return data;
}

export async function register(
  name: string,
  email: string,
  password: string,
  role: string
): Promise<AuthResponse> {
  const res = await fetch(`${API}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ name, email, password, role }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message ?? "Erreur création compte");
  }

  if (data.token) setToken(data.token);
  if (data.user) setUser(data.user);

  return data;
}

// ─────────────────────────────────────────────
// AUTH FETCH (IMPORTANT)
// ─────────────────────────────────────────────

export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  // JSON default
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // JWT HEADER
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  // AUTH ERROR HANDLING
  if (res.status === 401) {
    logout();
    throw new Error("Session expirée, reconnecte-toi");
  }

  return res;
}

// ─────────────────────────────────────────────
// AUTH HOOK
// ─────────────────────────────────────────────

import { useState } from "react";

export function useAuth() {
  const [user, setUserState] = useState<User | null>(getUser());

  async function loginUser(email: string, password: string) {
    const data = await login(email, password);
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
    login: loginUser,
    logout: logoutUser,
    isAuthenticated: !!getToken(),
  };
}