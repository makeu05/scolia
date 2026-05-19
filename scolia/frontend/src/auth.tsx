/**
 * auth.tsx — Système d'authentification SGS
 *
 * Ce fichier contient :
 *   1. AuthContext       → stocke l'utilisateur connecté
 *   2. AuthProvider      → enveloppe toute l'app
 *   3. useAuth()         → hook pour accéder à l'auth partout
 *   4. ProtectedRoute    → redirige vers /login si pas connecté
 *
 * Placer dans : src/auth.tsx
 *
 * Intégration Laravel Sanctum :
 *   - login()   → POST /api/login
 *   - logout()  → POST /api/logout
 *   - Le token est stocké dans localStorage sous "sgs_token"
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: number;
  nom: string;
  email: string;
  role: "admin" | "directeur" | "enseignant" | "comptable" | "parent";
  token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); // true au démarrage → vérifie le token stocké

  const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

  // ── Au démarrage : vérifier si un token est déjà stocké ──
  useEffect(() => {
    const storedUser = localStorage.getItem("sgs_user");
    const storedToken = localStorage.getItem("sgs_token");

    if (storedUser && storedToken) {
      try {
        const parsed = JSON.parse(storedUser) as AuthUser;
        setUser({ ...parsed, token: storedToken });

        // TODO Laravel : vérifier que le token est encore valide
        // axios.get(`${API_BASE}/api/me`, {
        //   headers: { Authorization: `Bearer ${storedToken}` }
        // }).catch(() => {
        //   localStorage.removeItem("sgs_user");
        //   localStorage.removeItem("sgs_token");
        //   setUser(null);
        // });

      } catch {
        localStorage.removeItem("sgs_user");
        localStorage.removeItem("sgs_token");
      }
    }
    setIsLoading(false);
  }, []);

  // ── Login ──
  const login = async (email: string, password: string): Promise<void> => {

    // TODO Laravel — décommenter quand le backend est prêt :
    // await axios.get(`${API_BASE}/sanctum/csrf-cookie`, { withCredentials: true });
    // const res = await axios.post(`${API_BASE}/api/login`, { email, password });
    // const { token, user: userData } = res.data;

    // ── MOCK (retirer quand Laravel est prêt) ──
    await new Promise((r) => setTimeout(r, 1000));

    if (email === "wrong@test.com") {
      throw new Error("Identifiants incorrects. Vérifiez votre email et mot de passe.");
    }

    // Simuler différents rôles selon l'email
    let mockRole: AuthUser["role"] = "admin";
    if (email.includes("enseignant")) mockRole = "enseignant";
    if (email.includes("comptable")) mockRole = "comptable";
    if (email.includes("parent")) mockRole = "parent";
    if (email.includes("directeur")) mockRole = "directeur";

    const mockUser: AuthUser = {
      id: 1,
      nom: "Administrateur",
      email,
      role: mockRole,
      token: "mock-token-" + Date.now(),
    };
    const token = mockUser.token;
    // ── Fin mock ──

    // Stocker dans localStorage
    localStorage.setItem("sgs_token", token);
    localStorage.setItem("sgs_user", JSON.stringify(mockUser));
    setUser(mockUser);
  };

  // ── Logout ──
  const logout = () => {
    // TODO Laravel — décommenter quand le backend est prêt :
    // axios.post(`${API_BASE}/api/logout`, {}, {
    //   headers: { Authorization: `Bearer ${user?.token}` }
    // }).finally(() => { ... });

    localStorage.removeItem("sgs_token");
    localStorage.removeItem("sgs_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// HOOK useAuth
// ─────────────────────────────────────────────────────────────────────────────

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans <AuthProvider>");
  return ctx;
};

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE PROTÉGÉE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Enveloppe une page protégée.
 * Si l'utilisateur n'est pas connecté → redirige vers /login
 * Si un rôle est requis et ne correspond pas → redirige vers /dashboard
 *
 * Utilisation dans App.tsx :
 *   <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
 *   <Route path="/finance"   element={<ProtectedRoute roles={["admin","comptable"]}><Finance /></ProtectedRoute>} />
 */

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: AuthUser["role"][]; // si vide → tous les rôles connectés ont accès
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Pendant la vérification du token au démarrage → écran de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-[#1a3a5c] flex items-center justify-center animate-pulse">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <p className="text-sm text-gray-400">Chargement…</p>
        </div>
      </div>
    );
  }

  // Pas connecté → login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Rôle non autorisé → dashboard
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// ─────────────────────────────────────────────────────────────────────────────
// REDIRECT SI DÉJÀ CONNECTÉ (pour la page login)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Si l'utilisateur est déjà connecté et va sur /login → redirige vers /dashboard
 */
export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};
