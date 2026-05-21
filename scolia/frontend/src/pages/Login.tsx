/**
 * Login.tsx — SGS (Système de Gestion Scolaire)
 *
 * Stack : React 18 + TypeScript + React Hook Form + Axios + React Router
 *
 * Dépendances :
 *   react-hook-form
 *   axios
 *   react-router-dom
 *   lucide-react
 *
 * Intégration Laravel Sanctum :
 *   1. POST /sanctum/csrf-cookie   → récupérer le cookie CSRF
 *   2. POST /api/login             → connecter l'utilisateur
 *   3. GET  /api/me                → récupérer le profil + rôle
 *
 * Redirection selon rôle :
 *   admin       → /dashboard
 *   enseignant  → /notes
 *   parent      → /suivi
 */

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  Eye, EyeOff, GraduationCap, Loader2, AlertCircle,
  Users, BookOpen, CreditCard, Calendar,
  MessageSquare, Award, Shield, ChevronRight,
} from "lucide-react";
import { useAuth } from "../service/auth";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────

// Redirection selon rôle — adapter aux rôles Laravel
const ROLE_REDIRECTS: Record<string, string> = {
  admin: "/dashboard",
  directeur: "/dashboard",
  enseignant: "/notes",
  parent: "/suivi",
  comptable: "/finance",
};

// ─────────────────────────────────────────────────────────────────────────────
// SERVICES PROPOSÉS (côté gauche)
// ─────────────────────────────────────────────────────────────────────────────

const SERVICES = [
  {
    icon: Users,
    titre: "Gestion des élèves",
    desc: "Suivi complet des dossiers, inscriptions et fiches élèves",
  },
  {
    icon: BookOpen,
    titre: "Notes & Évaluations",
    desc: "Saisie des notes, calcul des moyennes et bulletins automatiques",
  },
  {
    icon: CreditCard,
    titre: "Finance scolaire",
    desc: "Gestion des paiements, reçus PDF et suivi des impayés",
  },
  {
    icon: Calendar,
    titre: "Emploi du temps",
    desc: "Planification des cours et gestion des salles de classe",
  },
  {
    icon: MessageSquare,
    titre: "Communication",
    desc: "Messagerie interne et notifications aux parents via Alanya",
  },
  {
    icon: Award,
    titre: "Résultats & Bulletins",
    desc: "Génération automatique des bulletins trimestriels",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ILLUSTRATION SVG
// ─────────────────────────────────────────────────────────────────────────────

const SchoolIllustration: React.FC = () => (
  <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-sm">
    {/* Fond bâtiment */}
    <rect x="60" y="100" width="280" height="180" rx="8" fill="#1e3a5f" opacity="0.9" />
    {/* Toit */}
    <polygon points="40,105 200,30 360,105" fill="#16324f" />
    {/* Drapeau */}
    <line x1="200" y1="30" x2="200" y2="5" stroke="#94a3b8" strokeWidth="2" />
    <rect x="200" y="5" width="24" height="14" rx="2" fill="#3b82f6" />
    {/* Fenêtres rangée 1 */}
    {[90, 155, 220, 285].map((x, i) => (
      <g key={i}>
        <rect x={x} y="120" width="45" height="35" rx="4" fill="#93c5fd" opacity="0.4" />
        <rect x={x} y="120" width="45" height="35" rx="4" stroke="#60a5fa" strokeWidth="1" fill="none" />
        <line x1={x + 22} y1="120" x2={x + 22} y2="155" stroke="#60a5fa" strokeWidth="0.8" />
        <line x1={x} y1="137" x2={x + 45} y2="137" stroke="#60a5fa" strokeWidth="0.8" />
      </g>
    ))}
    {/* Fenêtres rangée 2 */}
    {[90, 155, 285].map((x, i) => (
      <g key={i}>
        <rect x={x} y="175" width="45" height="35" rx="4" fill="#93c5fd" opacity="0.3" />
        <rect x={x} y="175" width="45" height="35" rx="4" stroke="#60a5fa" strokeWidth="1" fill="none" />
        <line x1={x + 22} y1="175" x2={x + 22} y2="210" stroke="#60a5fa" strokeWidth="0.8" />
        <line x1={x} y1="192" x2={x + 45} y2="192" stroke="#60a5fa" strokeWidth="0.8" />
      </g>
    ))}
    {/* Porte */}
    <rect x="177" y="195" width="46" height="85" rx="4" fill="#0f2744" />
    <rect x="177" y="195" width="46" height="85" rx="4" stroke="#3b82f6" strokeWidth="1.5" fill="none" />
    <circle cx="218" cy="238" r="3" fill="#3b82f6" />
    {/* Escaliers */}
    {[0, 1, 2].map((i) => (
      <rect key={i} x={170 - i * 8} y={274 + i * 6} width={60 + i * 16} height="6" rx="1" fill="#0f2744" />
    ))}
    {/* Sol */}
    <rect x="20" y="295" width="360" height="8" rx="4" fill="#0f2744" opacity="0.5" />
    {/* Arbres */}
    <g>
      <rect x="30" y="230" width="8" height="65" rx="2" fill="#166534" />
      <ellipse cx="34" cy="220" rx="22" ry="28" fill="#15803d" />
      <ellipse cx="34" cy="210" rx="16" ry="20" fill="#16a34a" />
    </g>
    <g>
      <rect x="362" y="230" width="8" height="65" rx="2" fill="#166534" />
      <ellipse cx="366" cy="220" rx="22" ry="28" fill="#15803d" />
      <ellipse cx="366" cy="210" rx="16" ry="20" fill="#16a34a" />
    </g>
    {/* Étoiles déco */}
    {[[50, 50], [340, 40], [370, 80], [25, 130], [385, 150]].map(([cx, cy], i) => (
      <circle key={i} cx={cx} cy={cy} r="2" fill="#93c5fd" opacity="0.6" />
    ))}
    {/* Nuages */}
    <ellipse cx="80" cy="55" rx="30" ry="12" fill="white" opacity="0.12" />
    <ellipse cx="310" cy="65" rx="25" ry="10" fill="white" opacity="0.1" />
    {/* Élèves stylisés */}
    {[105, 145, 245, 285].map((x, i) => (
      <g key={i}>
        <circle cx={x} cy="268" r="7" fill={i % 2 === 0 ? "#fbbf24" : "#f9a8d4"} />
        <rect x={x - 7} y="275" width="14" height="18" rx="3"
          fill={i % 2 === 0 ? "#3b82f6" : "#a78bfa"} />
      </g>
    ))}
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [activeService, setActiveService] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    defaultValues: { email: "", password: "", remember: false },
  });

  // ── Carousel automatique des services ──
  React.useEffect(() => {
    const t = setInterval(() => {
      setActiveService((prev) => (prev + 1) % SERVICES.length);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  // ── Soumission ──
  const onSubmit = async (data: LoginForm) => {
    setApiError(null);
    try {
      // Appel via AuthContext — gère le mock et le vrai backend Laravel
      await login(data.email, data.password);

      // Lire le rôle depuis ce que login() vient de stocker dans localStorage
      const stored = localStorage.getItem("sgs_user");
      const role = stored ? JSON.parse(stored).role : "admin";

      navigate(ROLE_REDIRECTS[role] ?? "/dashboard");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Une erreur est survenue. Veuillez réessayer.";
      setApiError(msg);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ══════════════════════════════════════════
          CÔTÉ GAUCHE — Illustration + Services
      ══════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] bg-gradient-to-br from-[#0f2744] via-[#1a3a5c] to-[#1e4d7a] flex-col relative overflow-hidden">

        {/* Cercles décoratifs */}
        <div className="absolute top-[-80px] right-[-80px] h-[300px] w-[300px] rounded-full bg-white/5" />
        <div className="absolute bottom-[-60px] left-[-60px] h-[250px] w-[250px] rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-white/[0.02]" />

        <div className="relative z-10 flex flex-col h-full px-10 py-10">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">SGS</p>
              <p className="text-blue-300 text-xs leading-tight">Système de Gestion Scolaire</p>
            </div>
          </div>

          {/* Titre + illustration */}
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="mb-6">
              <SchoolIllustration />
            </div>
            <h1 className="text-3xl font-bold text-white leading-tight mb-3">
              Bienvenue sur votre<br />
              <span className="text-blue-300">espace de gestion</span>
            </h1>
            <p className="text-blue-200/80 text-sm max-w-xs leading-relaxed">
              Gérez votre établissement scolaire de manière simple, rapide et efficace au quotidien.
            </p>
          </div>

          {/* Services en carousel */}
          <div className="mt-auto">
            <p className="text-blue-300/70 text-xs font-semibold uppercase tracking-widest mb-4 text-center">
              Nos fonctionnalités
            </p>

            {/* Service actif */}
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4 mb-4 border border-white/10 transition-all duration-500">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-blue-400/20 flex items-center justify-center flex-shrink-0">
                  {React.createElement(SERVICES[activeService].icon, {
                    className: "h-4 w-4 text-blue-300",
                  })}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold leading-tight">
                    {SERVICES[activeService].titre}
                  </p>
                  <p className="text-blue-200/70 text-xs mt-0.5 leading-relaxed">
                    {SERVICES[activeService].desc}
                  </p>
                </div>
              </div>
            </div>

            {/* Dots navigation */}
            <div className="flex items-center justify-center gap-1.5">
              {SERVICES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveService(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === activeService
                      ? "bg-blue-400 w-5 h-1.5"
                      : "bg-white/30 w-1.5 h-1.5"
                  }`}
                />
              ))}
            </div>

            {/* Grille des autres services */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              {SERVICES.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setActiveService(i)}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all duration-200 ${
                    i === activeService
                      ? "bg-white/15 border border-white/20"
                      : "bg-white/5 border border-white/5 hover:bg-white/10"
                  }`}
                >
                  {React.createElement(s.icon, {
                    className: `h-4 w-4 ${i === activeService ? "text-blue-300" : "text-white/50"}`,
                  })}
                  <span className={`text-[10px] text-center leading-tight ${
                    i === activeService ? "text-white font-medium" : "text-white/50"
                  }`}>
                    {s.titre.split(" ").slice(0, 2).join(" ")}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          CÔTÉ DROIT — Formulaire
      ══════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 px-6 py-10">

        {/* Logo mobile */}
        <div className="flex lg:hidden items-center gap-2.5 mb-8">
          <div className="h-10 w-10 rounded-xl bg-[#1a3a5c] flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-gray-900 font-bold text-base leading-tight">SGS</p>
            <p className="text-gray-400 text-xs leading-tight">Gestion Scolaire</p>
          </div>
        </div>

        <div className="w-full max-w-[400px]">

          {/* En-tête formulaire */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 border border-blue-100">
              <Shield className="h-3.5 w-3.5" />
              Espace sécurisé
            </div>
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">
              Connexion
            </h2>
            <p className="text-gray-500 text-sm mt-1.5">
              Entrez vos identifiants pour accéder à votre espace.
            </p>
          </div>

          {/* Message d'erreur API */}
          {apiError && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Adresse email
              </label>
              <input
                type="email"
                placeholder="admin@ecole.cm"
                autoComplete="email"
                autoFocus
                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none ${
                  errors.email
                    ? "border-red-300 bg-red-50/30 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                    : "border-gray-200 bg-white focus:border-[#1a3a5c]/40 focus:ring-2 focus:ring-[#1a3a5c]/10"
                }`}
                {...register("email", {
                  required: "L'email est requis",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Adresse email invalide",
                  },
                })}
              />
              {errors.email && (
                <p className="flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Mot de passe */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <button
                  type="button"
                  className="text-xs text-[#1a3a5c] hover:underline font-medium"
                >
                  Mot de passe oublié ?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full px-4 py-3 pr-11 rounded-xl border text-sm transition-all outline-none ${
                    errors.password
                      ? "border-red-300 bg-red-50/30 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                      : "border-gray-200 bg-white focus:border-[#1a3a5c]/40 focus:ring-2 focus:ring-[#1a3a5c]/10"
                  }`}
                  {...register("password", {
                    required: "Le mot de passe est requis",
                    minLength: {
                      value: 6,
                      message: "Minimum 6 caractères",
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? "Masquer" : "Afficher"}
                >
                  {showPassword
                    ? <EyeOff className="h-4 w-4" />
                    : <Eye className="h-4 w-4" />
                  }
                </button>
              </div>
              {errors.password && (
                <p className="flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Se souvenir de moi */}
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 rounded border-gray-300 text-[#1a3a5c] focus:ring-[#1a3a5c]/20 cursor-pointer"
                {...register("remember")}
              />
              <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer select-none">
                Se souvenir de moi
              </label>
            </div>

            {/* Bouton soumettre */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#1a3a5c] hover:bg-[#16324f] active:scale-[0.98] text-white text-sm font-semibold transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connexion en cours…
                </>
              ) : (
                <>
                  Se connecter
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Nouveau sur l'application ?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")} // Ou le chemin vers votre route d'inscription (ex: /signup)
                className="font-semibold text-[#1a3a5c] hover:underline transition-colors"
              >
                Créer un compte
              </button>
            </p>
          </div>

          {/* Rôles disponibles (aide visuelle) */}
          <div className="mt-8 p-4 bg-white rounded-2xl border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Accès disponibles
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { role: "Administrateur", color: "bg-blue-50 text-blue-700" },
                { role: "Directeur", color: "bg-violet-50 text-violet-700" },
                { role: "Enseignant", color: "bg-emerald-50 text-emerald-700" },
                { role: "Comptable", color: "bg-amber-50 text-amber-700" },
              ].map((r) => (
                <div
                  key={r.role}
                  className={`${r.color} text-xs font-medium px-3 py-1.5 rounded-lg text-center`}
                >
                  {r.role}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-6">
            © {new Date().getFullYear()} SGS · Système de Gestion Scolaire
            <br />
            <span className="text-gray-300">Accès réservé au personnel autorisé</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;