import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  Eye, EyeOff, Loader2, AlertCircle,
  Users, BookOpen, CreditCard, Calendar,
  MessageSquare, Award, Shield, ArrowRight,
  User, Lock,
} from "lucide-react";
import { useAuth } from "../service/auth";

interface LoginForm {
  username: string;
  password: string;
  remember: boolean;
}

// Redirections par rôle (corrigé - sans doublons)
const ROLE_REDIRECTS: Record<string, string> = {
  root:       "/dashboard",
  admin:      "/dashboard",
  directeur:  "/dashboard",
  fondateur:  "/finance",
  enseignant: "/dashboard-enseignant",
  parent:     "/dashboard-parent",
};

const FEATURES = [
  { icon: Users,         titre: "Gestion des élèves",   desc: "Dossiers complets, inscriptions, suivi continu" },
  { icon: BookOpen,      titre: "Notes & Évaluations",  desc: "Bulletins automatiques, moyennes pondérées" },
  { icon: CreditCard,    titre: "Finance scolaire",     desc: "Paiements, reçus PDF, suivi des impayés" },
  { icon: Calendar,      titre: "Emploi du temps",      desc: "Planification des cours et des salles" },
  { icon: MessageSquare, titre: "Communication",        desc: "Messagerie parents via plateforme Alanya" },
  { icon: Award,         titre: "Résultats & Bulletins",desc: "Classements trimestriels automatisés" },
];

const ROLES = [
  { label: "Root",       color: "bg-red-50 text-red-700 border-red-100" },
  { label: "Admin",      color: "bg-blue-50 text-blue-700 border-blue-100" },
  { label: "Directeur",  color: "bg-violet-50 text-violet-700 border-violet-100" },
  { label: "Fondateur",  color: "bg-amber-50 text-amber-700 border-amber-100" },
  { label: "Enseignant", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  { label: "Parent",     color: "bg-pink-50 text-pink-700 border-pink-100" },
];

function ScoliaLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#0f1f3d" />
      <path d="M28 12 C28 12 12 11 12 20 C12 29 28 28 28 28" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <circle cx="25" cy="20" r="4" fill="#3b82f6" />
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [activeFeature, setActiveFeature] = useState(0);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    defaultValues: { username: "", password: "", remember: false },
  });

  // Carousel automatique
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % FEATURES.length);
    }, 3800);
    return () => clearInterval(interval);
  }, []);

  const onSubmit = async (data: LoginForm) => {
    setApiError(null);
    try {
      const result = await login(data.username, data.password);
      
      const role = result?.user?.role ?? "admin";
      const redirectPath = ROLE_REDIRECTS[role] ?? "/dashboard";

      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      setApiError("Identifiants incorrects. Vérifiez votre nom d'utilisateur et mot de passe.");
    }
  };

  const currentFeature = FEATURES[activeFeature];

  return (
    <div className="min-h-screen flex">
      {/* Côté gauche - Branding */}
      <div className="hidden lg:flex w-[52%] relative overflow-hidden bg-gradient-to-br from-[#0f1f3d] to-[#1a3a5c]">

        <div className="relative z-10 flex flex-col h-full p-10">
          <div className="flex items-center gap-3">
            <ScoliaLogo size={42} />
            <div>
              <p className="text-white font-bold text-2xl">SCOLIA</p>
              <p className="text-blue-300 text-sm -mt-1">Gestion Scolaire</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-white text-5xl font-bold leading-tight mb-4">
              Bienvenue sur<br />votre plateforme
            </h1>
            <p className="text-blue-200 max-w-md">
              Gérez votre établissement scolaire de façon moderne et efficace.
            </p>
          </div>

          {/* Feature Highlight */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {React.createElement(currentFeature.icon, { className: "w-8 h-8 text-blue-300" })}
              </div>
              <div>
                <p className="text-white font-semibold">{currentFeature.titre}</p>
                <p className="text-blue-200/80 text-sm mt-1">{currentFeature.desc}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Côté droit - Formulaire */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Connexion</h2>
              <p className="text-slate-500 mt-1">Accédez à votre espace de gestion</p>
            </div>

            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom d'utilisateur</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input
                    type="text"
                    {...register("username", { required: "Ce champ est requis" })}
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl focus:border-[#1a3a5c] outline-none"
                    placeholder="ex: admin.ecole"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password", { required: "Ce champ est requis" })}
                    className="w-full pl-11 pr-12 py-3 border border-slate-200 rounded-2xl focus:border-[#1a3a5c] outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-slate-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#1a3a5c] text-white py-3.5 rounded-2xl font-semibold hover:bg-[#132d4a] transition disabled:opacity-70"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={18} /> Connexion...
                  </span>
                ) : (
                  "Se connecter"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}