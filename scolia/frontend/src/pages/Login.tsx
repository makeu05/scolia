import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
  Eye, EyeOff, Loader2, User, Lock, ChevronLeft, ChevronRight,
  Users, BookOpen, CreditCard, Award, Calendar, Shield,
} from "lucide-react";
import { useAuth } from "../service/auth";

interface LoginForm {
  username: string;
  password: string;
}

const ROLE_REDIRECTS: Record<string, string> = {
  root:       "/dashboard",
  admin:      "/dashboard",
  directeur:  "/dashboard",
  fondateur:  "/finance",
  enseignant: "/dashboard-enseignant",
  parent:     "/dashboard-parent",
};

/* ─── Slides — real Unsplash photos ───────────────────────── */
const SLIDES = [
  {
    photo: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1920&q=85",
    overlayColor: "#0f1f3d",
    accent: "#3b82f6",
    accentLight: "rgba(59,130,246,0.25)",
    stat: "500+",
    statLabel: "Établissements accompagnés",
    title: "La gestion scolaire, réinventée pour le Cameroun",
    desc: "Une plateforme complète, intuitive et puissante pensée pour les écoles camerounaises.",
    icon: Shield,
  },
  {
    photo: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1920&q=85",
    overlayColor: "#1e1b4b",
    accent: "#a78bfa",
    accentLight: "rgba(167,139,250,0.25)",
    stat: "50 000+",
    statLabel: "Élèves suivis avec succès",
    title: "Des élèves épanouis, des parents rassurés",
    desc: "Dossiers numériques complets, inscriptions digitales et suivi personnalisé en temps réel.",
    icon: Users,
  },
  {
    photo: "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?auto=format&fit=crop&w=1920&q=85",
    overlayColor: "#0c3547",
    accent: "#38bdf8",
    accentLight: "rgba(56,189,248,0.25)",
    stat: "100%",
    statLabel: "Bulletins générés automatiquement",
    title: "Notes, bulletins et résultats en un clic",
    desc: "Saisie simplifiée, calcul automatique des moyennes et génération instantanée des bulletins.",
    icon: BookOpen,
  },
  {
    photo: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=85",
    overlayColor: "#064e3b",
    accent: "#34d399",
    accentLight: "rgba(52,211,153,0.25)",
    stat: "98%",
    statLabel: "Taux de recouvrement moyen",
    title: "Finances scolaires maîtrisées et transparentes",
    desc: "Suivi des paiements, reçus PDF automatiques et tableaux de bord financiers en temps réel.",
    icon: CreditCard,
  },
];

/* ─── SCOLIA Logo ──────────────────────────────────────────── */
function ScoliaLogo({ size = 40, dark = false }: { size?: number; dark?: boolean }) {
  const i = size;
  const left = i * 0.22, right = i * 0.72;
  const y1 = i * 0.28, y2 = i * 0.50, y3 = i * 0.72;
  const sw = Math.max(2, i * 0.075);
  const ds = Math.max(3, i * 0.11);
  const dx = right - ds / 2, dy = i * 0.13;
  const bg = dark ? "#0f1f3d" : "rgba(255,255,255,0.15)";
  return (
    <svg width={i} height={i} viewBox={`0 0 ${i} ${i}`} fill="none">
      <rect width={i} height={i} rx={i * 0.22} fill={bg} />
      <path
        d={`M${right} ${y1} C${right} ${y1} ${left} ${y1-i*.02} ${left} ${y2} C${left} ${y2+i*.14} ${right} ${y2-i*.02} ${right} ${y3} C${right} ${y3+i*.14} ${left} ${y3+i*.02} ${left} ${y3+i*.02}`}
        stroke="white" strokeWidth={sw} strokeLinecap="round" fill="none"
      />
      <rect x={dx} y={dy} width={ds} height={ds} rx={Math.max(1, ds * 0.35)} fill="#3b82f6" />
    </svg>
  );
}

/* ─── Main component ───────────────────────────────────────── */
export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError]         = useState<string | null>(null);
  const [current, setCurrent]           = useState(0);
  const [fadeOut, setFadeOut]           = useState(false);

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<LoginForm>({
    defaultValues: { username: "", password: "" },
  });

  const goTo = useCallback((idx: number) => {
    if (idx === current) return;
    setFadeOut(true);
    setTimeout(() => {
      setCurrent(idx);
      setFadeOut(false);
    }, 500);
  }, [current]);

  // Auto-advance
  useEffect(() => {
    const id = setInterval(() => goTo((current + 1) % SLIDES.length), 6000);
    return () => clearInterval(id);
  }, [current, goTo]);

  const onSubmit = async (data: LoginForm) => {
    setApiError(null);
    try {
      const result = await login(data.username, data.password);
      const role = result?.user?.role ?? "admin";
      navigate(ROLE_REDIRECTS[role] ?? "/dashboard", { replace: true });
    } catch {
      setApiError("Identifiants incorrects. Vérifiez votre nom d'utilisateur et mot de passe.");
    }
  };

  const slide = SLIDES[current];
  const Icon  = slide.icon;

  return (
    <div className="min-h-screen flex bg-white overflow-hidden">

      {/* ══ PANNEAU GAUCHE — Photo + contenu ═══════════════════ */}
      <div className="hidden lg:flex w-[58%] relative overflow-hidden flex-col">

        {/* Photo background with Ken Burns */}
        <div
          key={current}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${slide.photo}), linear-gradient(135deg, ${slide.overlayColor} 0%, #1a3a5c 100%)`,
            animation: "kenburns 12s ease-out forwards",
          }}
        />

        {/* Multi-layer overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(
              160deg,
              ${slide.overlayColor}e0 0%,
              ${slide.overlayColor}a0 40%,
              ${slide.overlayColor}c0 100%
            )`,
            transition: "background 0.8s ease",
          }}
        />
        {/* Bottom fade for text legibility */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 50%)",
          }}
        />
        {/* Subtle noise grain */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-10">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <ScoliaLogo size={46}/>
            <div>
              <p className="text-white font-black text-2xl tracking-tight leading-none">SCOLIA</p>
              <p className="text-white/50 text-xs mt-0.5 tracking-widest uppercase">Gestion Scolaire</p>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1"/>

          {/* Slide content — fades on transition */}
          <div
            style={{
              opacity: fadeOut ? 0 : 1,
              transform: fadeOut ? "translateY(12px)" : "translateY(0)",
              transition: "opacity 0.5s ease, transform 0.5s ease",
            }}
          >
            {/* Glassmorphism stat badge */}
            <div
              className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl mb-6"
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
                border: `1px solid ${slide.accent}50`,
                boxShadow: `0 4px 24px ${slide.accent}20`,
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: slide.accentLight }}
              >
                <Icon className="w-5 h-5" style={{ color: slide.accent }}/>
              </div>
              <div>
                <p className="text-white font-black text-2xl leading-none tracking-tight">{slide.stat}</p>
                <p className="text-white/55 text-xs mt-0.5">{slide.statLabel}</p>
              </div>
            </div>

            <h2 className="text-white font-black text-3xl leading-tight mb-3 max-w-lg"
              style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>
              {slide.title}
            </h2>
            <p className="text-white/65 text-base leading-relaxed max-w-md">
              {slide.desc}
            </p>
          </div>

          {/* Dot indicators + arrows */}
          <div className="flex items-center gap-2.5 mt-8">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="transition-all duration-400 rounded-full"
                style={{
                  width:  i === current ? 28 : 6,
                  height: 6,
                  background: i === current ? slide.accent : "rgba(255,255,255,0.3)",
                }}
              />
            ))}
            <div className="flex-1"/>
            <div className="flex gap-2">
              <button
                onClick={() => goTo((current - 1 + SLIDES.length) % SLIDES.length)}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}
              >
                <ChevronLeft className="w-4 h-4 text-white/70"/>
              </button>
              <button
                onClick={() => goTo((current + 1) % SLIDES.length)}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}
              >
                <ChevronRight className="w-4 h-4 text-white/70"/>
              </button>
            </div>
          </div>

          {/* Photo credit */}
          <p className="text-white/25 text-[10px] mt-3">
            Photo: Unsplash · Tous droits réservés
          </p>
        </div>
      </div>

      {/* ══ PANNEAU DROIT — Formulaire ══════════════════════════ */}
      <div className="flex-1 flex items-center justify-center bg-[#f7f8fc] p-6 relative">

        {/* Subtle background pattern */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #0f1f3d 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="w-full max-w-[420px] relative z-10">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <ScoliaLogo size={40} dark/>
            <div>
              <p className="text-[#0f1f3d] font-black text-xl tracking-tight">SCOLIA</p>
              <p className="text-slate-400 text-xs uppercase tracking-widest">Gestion Scolaire</p>
            </div>
          </div>

          {/* Greeting */}
          <div className="mb-8">
            <h1 className="text-[28px] font-black text-[#0f1f3d] mb-2 tracking-tight leading-tight">
              Bon retour !
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              Connectez-vous à votre espace de gestion scolaire
            </p>
          </div>

          {/* Card */}
          <div
            className="bg-white rounded-3xl p-8"
            style={{
              boxShadow: "0 8px 40px rgba(15,31,61,0.08), 0 2px 8px rgba(15,31,61,0.04)",
              border: "1px solid rgba(15,31,61,0.06)",
            }}
          >
            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 mb-6 text-sm flex items-start gap-2">
                <span className="mt-0.5 text-base">⚠</span>
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Identifiant</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#3b82f6] w-4 h-4 transition-colors"/>
                  <input
                    type="text"
                    {...register("username", { required: true })}
                    className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-2xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#3b82f6] focus:ring-3 focus:ring-blue-100 transition-all"
                    placeholder="ex : admin.lycee"
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Mot de passe</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#3b82f6] w-4 h-4 transition-colors"/>
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password", { required: true })}
                    className="w-full pl-11 pr-12 py-3.5 border border-slate-200 rounded-2xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#3b82f6] focus:ring-3 focus:ring-blue-100 transition-all"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-white py-4 rounded-2xl font-bold text-sm transition-all duration-200 disabled:opacity-70 active:scale-[0.98] mt-2"
                style={{
                  background: "linear-gradient(135deg, #0f1f3d 0%, #1a3a5c 100%)",
                  boxShadow: "0 6px 20px rgba(15,31,61,0.3), 0 2px 4px rgba(15,31,61,0.2)",
                }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin"/>
                    Connexion en cours…
                  </span>
                ) : "Se connecter →"}
              </button>
            </form>
          </div>

          {/* Features strip */}
          <div className="mt-5 grid grid-cols-3 gap-2.5">
            {[
              { icon: Users,    label: "Élèves & Parents",    color: "#3b82f6" },
              { icon: Award,    label: "Notes & Bulletins",   color: "#8b5cf6" },
              { icon: Calendar, label: "Emploi du temps",     color: "#10b981" },
            ].map(({ icon: I, label, color }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-2xl text-center"
                style={{ border: "1px solid rgba(15,31,61,0.06)", boxShadow: "0 1px 4px rgba(15,31,61,0.04)" }}
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
                  <I className="w-4 h-4" style={{ color }}/>
                </div>
                <span className="text-[10px] font-semibold text-slate-500 leading-tight">{label}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-slate-400 mt-6 tracking-wide">
            © 2025 SCOLIA · Système de Gestion Scolaire · Cameroun
          </p>
        </div>
      </div>
    </div>
  );
}
