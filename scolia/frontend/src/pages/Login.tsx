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

const ROLE_REDIRECTS: Record<string, string> = {
  root:       "/dashboard",
  admin:      "/dashboard",
  directeur:  "/dashboard",
  fondateur:  "/finance",
  enseignant: "/dashboard-enseignant",
  parent:     "/dashboard-parent",
  root: "/dashboard", admin: "/dashboard", directeur: "/dashboard",
  fondateur: "/finance", enseignant: "/dashboard-enseignant", parent: "/dashboard-parent",
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
  { label: "Root",       color: "bg-red-500/15 text-red-300 ring-1 ring-red-500/20" },
  { label: "Admin",      color: "bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/20" },
  { label: "Directeur",  color: "bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/20" },
  { label: "Fondateur",  color: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/20" },
  { label: "Enseignant", color: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20" },
  { label: "Parent",     color: "bg-pink-500/15 text-pink-300 ring-1 ring-pink-500/20" },
];

// Logo SVG inline — pas besoin du composant Logo
function ScoliaLogo({ size = 40, dark = false }: { size?: number; dark?: boolean }) {
  const i = size;
  const left = i * 0.22, right = i * 0.72;
  const y1 = i * 0.28, y2 = i * 0.50, y3 = i * 0.72;
  const sw = Math.max(2, i * 0.075);
  const ds = Math.max(3, i * 0.11);
  const dx = right - ds / 2, dy = i * 0.13;
  return (
    <svg width={i} height={i} viewBox={`0 0 ${i} ${i}`} fill="none">
      <rect width={i} height={i} rx={i * 0.22} fill={dark ? "rgba(255,255,255,0.12)" : "#0f1f3d"} />
      <path
        d={`M${right} ${y1} C${right} ${y1} ${left} ${y1-i*.02} ${left} ${y2} C${left} ${y2+i*.14} ${right} ${y2-i*.02} ${right} ${y3} C${right} ${y3+i*.14} ${left} ${y3+i*.02} ${left} ${y3+i*.02}`}
        stroke="white" strokeWidth={sw} strokeLinecap="round" fill="none"
      />
      <rect x={dx} y={dy} width={ds} height={ds} rx={Math.max(1, ds * 0.35)} fill={dark ? "#60a5fa" : "#3b82f6"} />
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError]         = useState<string | null>(null);
  const [activeFeature, setActiveFeature] = useState(0);
  
  const [animDir, setAnimDir]           = useState<"in" | "out">("in");
  const [mounted, setMounted]           = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    defaultValues: { username: "", password: "", remember: false },
  });

  useEffect(() => {
    setMounted(true);
    const t = setInterval(() => {
      setAnimDir("out");
      setTimeout(() => {
        setActiveFeature(p => (p + 1) % FEATURES.length);
        setAnimDir("in");
      }, 350);
    }, 3800);
    return () => clearInterval(t);
  }, []);

  const goTo = (i: number) => {
    setAnimDir("out");
    setTimeout(() => { setActiveFeature(i); setAnimDir("in"); }, 300);
  };

  const onSubmit = async (data: LoginForm) => {
    setApiError(null);
    try {
      const result = await login(data.username, data.password);
      await new Promise(r => setTimeout(r, 80));
      const role = result?.user?.role ?? "admin";
      navigate(ROLE_REDIRECTS[role] ?? "/dashboard", { replace: true });
    } catch {
      setApiError("Identifiants incorrects. Vérifiez votre nom d'utilisateur et mot de passe.");
    }
  };

  const f = FEATURES[activeFeature];

  return (
    <div className="min-h-screen flex">

      {/* ── GAUCHE — Branding ─────────────────────────────── */}
      <div className="hidden lg:flex flex-col w-[52%] relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #060d1a 0%, #0f1f3d 45%, #16324f 100%)" }}>

        {/* Grille */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }} />

        {/* Halos */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 65%)" }} />
        <div className="absolute -bottom-48 -left-24 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 65%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 60%)" }} />

        <div className="relative z-10 flex flex-col h-full p-10">

          {/* Logo */}
          <div className={`flex items-center gap-3 transition-all duration-600 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"}`}>
            <ScoliaLogo size={40} dark />
            <div>
              <p className="text-white font-bold text-lg" style={{ letterSpacing: "-0.03em" }}>SCOLIA</p>
              <p className="text-slate-400 text-[11px] mt-0.5">Système de Gestion Scolaire</p>
            </div>
          </div>

          {/* Headline */}
          <div className={`mt-auto mb-10 transition-all duration-700 delay-150 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <p className="text-blue-400/70 text-xs font-semibold mb-4 uppercase tracking-[0.15em]">
              Plateforme ERP Scolaire
            </p>
            <h1 className="text-white font-bold leading-[1.1] mb-5"
              style={{ fontSize: "clamp(30px, 3.2vw, 46px)", letterSpacing: "-0.04em" }}>
              Gérez votre école<br />
              <span className="text-blue-400">intelligemment.</span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Une plateforme complète pour les administrations scolaires,
              de la maternelle au lycée — adaptée à chaque établissement.
            </p>
          </div>

          {/* Feature carousel — animé */}
          <div className={`transition-all duration-700 delay-250 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 mb-4"
              style={{ minHeight: 88, backdropFilter: "blur(8px)" }}>

              {/* Halo derrière l'icône */}
              <div className="absolute top-0 left-0 w-32 h-32 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)" }} />

              <div
                className="relative z-10 flex items-start gap-4"
                style={{
                  opacity: animDir === "in" ? 1 : 0,
                  transform: animDir === "in" ? "translateY(0)" : "translateY(6px)",
                  transition: "opacity 0.35s ease, transform 0.35s ease",
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {React.createElement(f.icon, { className: "w-5 h-5 text-blue-300" })}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{f.titre}</p>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">{f.desc}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  key={activeFeature}
                  className="h-full bg-blue-400/60 rounded-full"
                  style={{
                    animation: "progressBar 3.8s linear forwards",
                  }}
                />
              </div>
            </div>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {FEATURES.map((_, i) => (
                <button key={i} onClick={() => goTo(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === activeFeature
                      ? "w-5 h-1.5 bg-blue-400"
                      : "w-1.5 h-1.5 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
              <span className="ml-auto text-[10px] text-slate-500 font-medium">
                {activeFeature + 1} / {FEATURES.length}
              </span>
            </div>
          </div>

          {/* Rôles */}
          <div className={`mt-8 transition-all duration-700 delay-350 ${mounted ? "opacity-100" : "opacity-0"}`}>
            <p className="text-slate-500 text-[10px] uppercase tracking-[0.12em] font-semibold mb-3">
              Accès disponibles
            </p>
            <div className="flex flex-wrap gap-2">
              {ROLES.map(r => (
                <span key={r.label}
                  className={`text-xs font-medium px-3 py-1 rounded-full ${r.color}`}>
                  {r.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── DROITE — Formulaire ───────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 px-6 py-12 relative">

        {/* Fond subtil */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 80% 20%, rgba(59,130,246,0.04) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(99,102,241,0.03) 0%, transparent 50%)",
          }} />

        {/* Logo mobile */}
        <div className="flex lg:hidden items-center gap-2.5 mb-10">
          <ScoliaLogo size={36} />
          <div>
            <p className="font-bold text-[#0f1f3d] text-base" style={{ letterSpacing: "-0.02em" }}>SCOLIA</p>
            <p className="text-slate-400 text-[10px]">Gestion scolaire</p>
          </div>
        </div>

        <div className={`relative z-10 w-full max-w-[390px] transition-all duration-500 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

          {/* Card formulaire */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8"
            style={{ boxShadow: "0 4px 32px rgba(15,31,61,0.08), 0 1px 0 rgba(255,255,255,0.8) inset" }}>

            {/* En-tête */}
            <div className="mb-7">
              <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 text-[11px] font-semibold px-3 py-1.5 rounded-full mb-5 border border-blue-100/80">
                <Shield className="w-3 h-3" />
                Espace sécurisé
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1.5" style={{ letterSpacing: "-0.03em" }}>
                Connexion
              </h2>
              <p className="text-slate-400 text-sm">
                Entrez vos identifiants pour accéder à votre espace.
              </p>
            </div>

            {/* Erreur */}
            {apiError && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{apiError}</span>
              </div>
            )}

            {/* Formulaire */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Nom d'utilisateur</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input type="text" placeholder="belva" autoComplete="username" autoFocus
                    className={`input pl-10 ${errors.username ? "input-error" : ""}`}
                    {...register("username", { required: "Requis", minLength: { value: 3, message: "Min. 3 caractères" } })}
                  />
                </div>
                {errors.username && (
                  <p className="flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="w-3 h-3" />{errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700">Mot de passe</label>
                  <button type="button" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                    Oublié ?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={`input pl-10 pr-11 ${errors.password ? "input-error" : ""}`}
                    {...register("password", { required: "Requis", minLength: { value: 4, message: "Min. 4 caractères" } })}
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="w-3 h-3" />{errors.password.message}
                  </p>
                )}
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 accent-[#0f1f3d]"
                  {...register("remember")} />
                <span className="text-sm text-slate-600">Se souvenir de moi</span>
              </label>

              <button type="submit" disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm
                  bg-[#0f1f3d] hover:bg-[#1a3a5c] active:scale-[0.98] text-white
                  transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
                style={{ boxShadow: "0 2px 12px rgba(15,31,61,0.3)", letterSpacing: "-0.01em" }}
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Connexion en cours…</>
                ) : (
                  <>Se connecter <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          </div>

          {/* Rôles en bas */}
          <div className="mt-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[11px] text-slate-400 font-medium">Accès disponibles</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { role: "Root",       color: "bg-red-50 text-red-700 border-red-100" },
                { role: "Admin",      color: "bg-blue-50 text-blue-700 border-blue-100" },
                { role: "Directeur",  color: "bg-violet-50 text-violet-700 border-violet-100" },
                { role: "Fondateur",  color: "bg-amber-50 text-amber-700 border-amber-100" },
                { role: "Enseignant", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
                { role: "Parent",     color: "bg-pink-50 text-pink-700 border-pink-100" },
              ].map(r => (
                <div key={r.role}
                  className={`text-xs font-medium px-2 py-1.5 rounded-lg text-center border ${r.color}`}>
                  {r.role}
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-[11px] text-slate-400 mt-5">
            © {new Date().getFullYear()} SCOLIA · Accès réservé au personnel autorisé
          </p>
        </div>
      </div>

      {/* Animation progress bar */}
      <style>{`
        @keyframes progressBar {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </div>
  );
}