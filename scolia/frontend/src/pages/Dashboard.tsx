import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, BookOpen, UserCheck, Wallet, AlertTriangle, Award,
  TrendingUp, ArrowUpRight, ArrowRight, BarChart3, Plus,
  ClipboardList, FileText, CreditCard, CalendarDays, ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { authFetch, getUser } from "../service/auth";
import { useAnnee } from "../context/AnneeContext";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

/* ── Compteur animé (préserve suffixe M/K/%) ────── */
function Counter({ value, duration = 900 }: { value: number | string; duration?: number }) {
  const [display, setDisplay] = useState(0);

  const str    = String(value);
  const numVal = parseFloat(str.replace(/[^0-9.]/g, "")) || 0;
  const suffix = str.replace(/[0-9.,\s]/g, ""); // garde M, K, %, etc.
  // Texte pur (aucun chiffre) → afficher tel quel
  const isPureText = !/[0-9]/.test(str);

  useEffect(() => {
    if (isPureText) return;
    const start = performance.now();
    const step  = (now: number) => {
      const p    = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(numVal * ease);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [numVal]);

  if (isPureText) return <span>{value}</span>;

  // Si la valeur a une décimale (ex: 1.5M) garder 1 décimale, sinon entier formaté
  const formatted = numVal % 1 !== 0
    ? display.toFixed(1)
    : Math.round(display).toLocaleString("fr-FR");

  return <span>{formatted}{suffix}</span>;
}

/* ── Slides diaporama ───────────────────────────── */
const SLIDES = [
  {
    photo:   "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1600&q=80",
    overlay: "linear-gradient(125deg,rgba(8,12,35,0.97) 0%,rgba(15,31,61,0.82) 45%,rgba(79,70,229,0.28) 100%)",
    accent:  "#a5b4fc",
    tag:     "Tableau de bord",
    caption: "Vue globale de votre établissement",
  },
  {
    photo:   "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1600&q=80",
    overlay: "linear-gradient(125deg,rgba(5,20,50,0.97) 0%,rgba(14,165,233,0.42) 52%,rgba(6,182,212,0.2) 100%)",
    accent:  "#67e8f9",
    tag:     "Communauté scolaire",
    caption: "Des milliers d'élèves, une seule plateforme",
  },
  {
    photo:   "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1600&q=80",
    overlay: "linear-gradient(125deg,rgba(20,5,45,0.97) 0%,rgba(139,92,246,0.44) 52%,rgba(236,72,153,0.2) 100%)",
    accent:  "#c4b5fd",
    tag:     "Apprentissage continu",
    caption: "Suivez la progression de chaque apprenant",
  },
  {
    photo:   "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=1600&q=80",
    overlay: "linear-gradient(125deg,rgba(5,25,20,0.97) 0%,rgba(16,185,129,0.42) 52%,rgba(6,182,212,0.18) 100%)",
    accent:  "#6ee7b7",
    tag:     "Réussite & Excellence",
    caption: "Construire l'avenir du Cameroun, ensemble",
  },
];
const SLIDE_MS = 6000;

/* ── Types ──────────────────────────────────────── */
interface DashData {
  totalEleves: number; totalClasses: number; totalEnseignants: number;
  totalCollecte: number; nbDebiteurs: number; tauxReussite: number;
  recents: any[]; parMois: { mois: string; total: number }[];
  elevesActifs: number; montantImpaye: number;
}

const MOIS_FR = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];

const KPI_CFG = [
  { label: "Élèves",       icon: Users,        g1: "#6366f1", g2: "#8b5cf6", path: "/eleves"               },
  { label: "Classes",      icon: BookOpen,     g1: "#ec4899", g2: "#f43f5e", path: "/classes"              },
  { label: "Enseignants",  icon: UserCheck,    g1: "#0ea5e9", g2: "#06b6d4", path: "/enseignants"          },
  { label: "Collecté (F)", icon: Wallet,       g1: "#10b981", g2: "#059669", path: "/finance"              },
  { label: "Débiteurs",    icon: AlertTriangle,g1: "#f59e0b", g2: "#ef4444", path: "/paiements/par-classe" },
  { label: "Réussite",     icon: Award,        g1: "#a855f7", g2: "#ec4899", path: "/notes/classement"     },
];

const ACTIONS = [
  { label: "Inscrire un élève",    sub: "Créer un dossier",  path: "/eleves/nouveau",    icon: Users,        g1: "#6366f1", g2: "#8b5cf6" },
  { label: "Saisir les notes",     sub: "Évaluations",       path: "/notes/saisie",      icon: ClipboardList,g1: "#ec4899", g2: "#f43f5e" },
  { label: "Enregistrer paiement", sub: "Scolarité",         path: "/paiements/nouveau", icon: CreditCard,   g1: "#10b981", g2: "#059669" },
  { label: "Générer un bulletin",  sub: "Notes & résultats", path: "/notes/bulletin",    icon: FileText,     g1: "#f59e0b", g2: "#f97316" },
];

const GRAD_AVA = [
  ["#6366f1","#8b5cf6"],["#ec4899","#f43f5e"],["#0ea5e9","#06b6d4"],
  ["#10b981","#059669"],["#f59e0b","#f97316"],
];

/* ══════════════════════════════════════════════════ */
export default function Dashboard() {
  const navigate = useNavigate();
  const user     = getUser();
  const { idAca, anneeActive } = useAnnee();

  const [data, setData]       = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);

  const [slideIdx, setSlideIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSlideIdx(i => (i + 1) % SLIDES.length), SLIDE_MS);
  }

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  function goTo(i: number) {
    if (i === slideIdx) return;
    setSlideIdx(i);
    startTimer();
  }

  useEffect(() => { if (idAca) loadData(); }, [idAca]);

  async function loadData() {
  setLoading(true);
  try {
    // ✅ authFetch gère le token ET le 401 (déconnexion auto)
    const get = async (url: string) => {
      const r = await authFetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    };

    const [eleves, classes, enseignants, dash, stats] = await Promise.all([
      get(`${API}/eleves?actif=1`),
      get(`${API}/classes`),
      get(`${API}/enseignants?actif=1`),
      get(`${API}/paiements/dashboard?idAca=${idAca}`),
      get(`${API}/paiements/stats?idAca=${idAca}`),
    ]);

    const countOf = (res: any): number => {
      if (res == null) return 0;
      if (typeof res.total === "number") return res.total;
      if (Array.isArray(res)) return res.length;
      if (Array.isArray(res.data)) return res.data.length;
      return 0;
    };

    setData({
      totalEleves:      countOf(eleves),
      totalClasses:     countOf(classes),
      totalEnseignants: countOf(enseignants),
      totalCollecte:    dash.totalCollecte ?? 0,
      nbDebiteurs:      dash.nbDebiteurs ?? 0,
      tauxReussite:     92,
      recents:          dash.recents ?? [],
      parMois:          stats.parMois ?? [],
      elevesActifs:     countOf(eleves),
      montantImpaye:    Math.max(0, (stats.totalAttendu ?? 0) - (stats.totalCollecte ?? 0)),
    });
  } catch (e) { console.error(e); }
  finally { setLoading(false); }
}

  function fmt(n: number) {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
    return String(n);
  }
  function timeAgo(d: string) {
    const diff = Date.now() - new Date(d).getTime();
    const m    = Math.floor(diff / 60000);
    if (m < 1)  return "À l'instant";
    if (m < 60) return `${m}min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}j`;
  }

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 5)  return "Bonne nuit";
    if (h < 12) return "Bonjour";
    if (h < 18) return "Bon après-midi";
    return "Bonsoir";
  })();

  const dateStr = new Date().toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  // ✅ Valeurs KPI — fmt() préserve M/K et le Counter sait l'animer
  const kpiVals = data
    ? [data.totalEleves, data.totalClasses, data.totalEnseignants,
       fmt(data.totalCollecte), data.nbDebiteurs, `${data.tauxReussite}%`]
    : [0, 0, 0, "0", 0, "0%"];

  const maxMois = data?.parMois?.length ? Math.max(...data.parMois.map(m => m.total), 1) : 1;
  const moisCur = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const txPaie  = data && data.elevesActifs > 0
    ? Math.round(((data.elevesActifs - data.nbDebiteurs) / data.elevesActifs) * 100) : 0;

  const R    = 34;
  const CIRC = 2 * Math.PI * R;
  const DASH = ((100 - txPaie) / 100) * CIRC;

  const slide = SLIDES[slideIdx];
  const kpiDelay = [0, 70, 140, 210, 280, 350];

  return (
    <div style={{ background: "var(--bg-app)", minHeight: "100vh" }}>

      {/* HÉRO DIAPORAMA */}
      <div className="relative overflow-hidden select-none" style={{ minHeight: 310 }}>
        {SLIDES.map((s, i) => (
          <img key={i} src={s.photo} alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity:    i === slideIdx ? 1 : 0,
              transition: "opacity 1.6s cubic-bezier(0.4,0,0.2,1)",
              filter:     "brightness(0.22) saturate(1.15)",
              animation:  i === slideIdx ? `kenburns ${SLIDE_MS}ms ease-out forwards` : "none",
            }} />
        ))}
        {SLIDES.map((s, i) => (
          <div key={i} className="absolute inset-0"
            style={{ background: s.overlay, opacity: i === slideIdx ? 1 : 0, transition: "opacity 1.6s ease", pointerEvents: "none" }} />
        ))}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.055) 1px,transparent 1px)",
          backgroundSize: "26px 26px",
        }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: `radial-gradient(ellipse at 80% 50%,${slide.accent}26 0%,transparent 55%)`, transition: "all 1.5s ease" }} />

        <div key={slideIdx} className="relative z-10 px-6 md:px-10 pt-10 pb-20 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div>
            <div className="animate-hero-slide flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: slide.accent }} />
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: `${slide.accent}cc` }}>
                {slide.tag}
              </span>
            </div>
            <h1 className="animate-hero-slide font-black text-white leading-none mb-2"
              style={{ animationDelay: "60ms", fontSize: "clamp(2rem,4vw,3.2rem)", letterSpacing: "-0.045em" }}>
              {greeting},<br />
              <span style={{ background: `linear-gradient(90deg,${slide.accent},rgba(255,255,255,0.6))`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {user?.name}
              </span>
            </h1>
            <p className="animate-hero-slide text-sm mb-4"
              style={{ animationDelay: "120ms", color: "rgba(255,255,255,0.38)" }}>
              {slide.caption}
            </p>
            <div className="animate-hero-slide flex items-center gap-3 flex-wrap" style={{ animationDelay: "180ms" }}>
              <span className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                <CalendarDays style={{ width: 12, height: 12 }} /> {dateStr}
              </span>
              {anneeActive?.libelle && (
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.12)" }}>
                  {anneeActive.libelle}
                </span>
              )}
            </div>
          </div>

          {data && (
            <div className="animate-hero-slide flex gap-2 flex-wrap flex-shrink-0" style={{ animationDelay: "240ms" }}>
              {[
                { v: data.totalEleves,            l: "Élèves",   c: slide.accent },
                { v: data.totalEnseignants,       l: "Profs",    c: "rgba(255,255,255,0.6)" },
                { v: fmt(data.totalCollecte)+" F",l: "Collecté", c: "#6ee7b7" },
              ].map(s => (
                <div key={s.l} className="px-4 py-3 rounded-2xl text-center"
                  style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", minWidth: 72 }}>
                  <p className="font-black text-xl leading-none" style={{ color: s.c }}>{s.v}</p>
                  <p className="text-[10px] font-semibold mt-1 uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.3)" }}>{s.l}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className="rounded-full transition-all duration-500 cursor-pointer"
              style={{
                height:     6,
                width:      i === slideIdx ? 28 : 6,
                background: i === slideIdx ? slide.accent : "rgba(255,255,255,0.25)",
                boxShadow:  i === slideIdx ? `0 0 10px ${slide.accent}bb` : "none",
              }} />
          ))}
        </div>

        {(["left","right"] as const).map(dir => (
          <button key={dir}
            onClick={() => goTo(dir === "left"
              ? (slideIdx - 1 + SLIDES.length) % SLIDES.length
              : (slideIdx + 1) % SLIDES.length)}
            className={`absolute ${dir === "left" ? "left-4" : "right-4"} top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all`}
            style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.22)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"; }}>
            {dir === "left"
              ? <ChevronLeft style={{ width: 16, height: 16, color: "#fff" }} />
              : <ChevronRight style={{ width: 16, height: 16, color: "#fff" }} />}
          </button>
        ))}
      </div>

      {/* KPI CARDS */}
      <div className="px-6 md:px-10 -mt-10 relative z-10">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 space-y-3" style={{ boxShadow: "var(--shadow-xl)" }}>
                <div className="skeleton w-12 h-12 rounded-2xl" />
                <div className="skeleton h-8 w-14 rounded-lg" />
                <div className="skeleton h-3 w-20 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {KPI_CFG.map((k, i) => (
              <button key={i} onClick={() => navigate(k.path)}
                className="group relative bg-white rounded-2xl text-left overflow-hidden animate-float-up"
                style={{
                  boxShadow:      "var(--shadow-xl)",
                  border:         "1px solid rgba(255,255,255,0.85)",
                  animationDelay: `${kpiDelay[i]}ms`,
                  transition:     "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = "translateY(-8px) scale(1.03)";
                  el.style.boxShadow = `0 28px 60px ${k.g1}44, 0 8px 20px rgba(0,0,0,0.1)`;
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = "";
                  el.style.boxShadow = "var(--shadow-xl)";
                }}>
                <div className="absolute top-0 left-0 right-0 h-[3px]"
                  style={{ background: `linear-gradient(90deg,${k.g1},${k.g2})` }} />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"
                  style={{ background: `radial-gradient(ellipse at 50% 0%,${k.g1}1c 0%,transparent 70%)` }} />
                <div className="p-4 pt-5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                    style={{ background: `linear-gradient(135deg,${k.g1},${k.g2})`, boxShadow: `0 4px 16px ${k.g1}66` }}>
                    <k.icon style={{ width: 20, height: 20, color: "#fff" }} />
                  </div>
                  <p className="font-black leading-none mb-1" style={{ fontSize: "2rem", color: "var(--text-900)", letterSpacing: "-0.05em" }}>
                    <Counter value={kpiVals[i]} />
                  </p>
                  <p className="text-[11px] font-semibold" style={{ color: "var(--text-400)" }}>{k.label}</p>
                  <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                    <div className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, Math.max(6, (Number(String(kpiVals[i]).replace(/[^0-9]/g,"")) / (i === 0 ? 50 : i === 5 ? 100 : 20)) * 100))}%`,
                        background: `linear-gradient(90deg,${k.g1},${k.g2})`,
                        transition: "width 1.4s cubic-bezier(0.4,0,0.2,1)",
                      }} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* MAIN CONTENT */}
      {!loading && data && (
        <div className="px-6 md:px-10 mt-5 space-y-5 pb-10">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

            {/* Bar chart */}
            <div className="xl:col-span-2 bg-white rounded-2xl overflow-hidden animate-fade-in" style={{ boxShadow: "var(--shadow-md)" }}>
              <div className="flex items-center justify-between px-6 pt-5 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
                <div>
                  <p className="font-bold text-sm" style={{ color: "var(--text-900)" }}>Évolution des paiements</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-400)" }}>{anneeActive?.libelle ?? "Année en cours"}</p>
                </div>
                <button onClick={() => navigate("/paiements/stats")}
                  className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#6366f1" }}>
                  Voir tout <ArrowRight style={{ width: 12, height: 12 }} />
                </button>
              </div>
              <div className="px-6 pt-5 pb-4">
                {data.parMois && data.parMois.length > 0 ? (
                  <div className="relative" style={{ height: 200 }}>
                    {[0, 25, 50, 75, 100].map(pct => (
                      <div key={pct} className="absolute left-0 right-0 flex items-center gap-2" style={{ bottom: `${pct}%` }}>
                        <span className="text-[9px] font-semibold w-7 text-right shrink-0" style={{ color: "var(--text-300)" }}>
                          {pct === 0 ? "" : `${Math.round((maxMois * pct) / 100 / 1000)}k`}
                        </span>
                        <div className="flex-1 border-t"
                          style={{ borderColor: pct === 0 ? "var(--border-hover)" : "var(--border)", borderStyle: pct === 0 ? "solid" : "dashed" }} />
                      </div>
                    ))}
                    <div className="absolute inset-0 pl-9 flex items-end gap-1">
                      {data.parMois.map((m, bi) => {
                        const pct   = Math.round((m.total / maxMois) * 100);
                        const label = MOIS_FR[parseInt(m.mois.split("-")[1]) - 1] ?? m.mois;
                        const isCur = m.mois === moisCur;
                        return (
                          <div key={m.mois} className="flex-1 flex flex-col items-center gap-1 group relative">
                            <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 pointer-events-none z-10 transition-all"
                              style={{ transform: "translateY(4px)", transition: "all 0.15s" }}>
                              <div className="text-[10px] font-bold text-white px-2 py-1 rounded-lg whitespace-nowrap"
                                style={{ background: isCur ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "#1e293b" }}>
                                {fmt(m.total)} F
                              </div>
                            </div>
                            <div className="w-full rounded-t-lg animate-bar-fill"
                              style={{
                                height:         `${Math.max(pct, 3)}%`,
                                animationDelay: `${bi * 45}ms`,
                                background:     isCur
                                  ? "linear-gradient(180deg,#818cf8 0%,#6366f1 50%,#4f46e5 100%)"
                                  : "linear-gradient(180deg,#e2e8f0 0%,#cbd5e1 100%)",
                                boxShadow:      isCur ? "0 -3px 16px rgba(99,102,241,0.5)" : "none",
                                cursor:         "default",
                                transition:     "opacity 0.2s",
                              }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.72"; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }} />
                            <span className="text-[9px] font-bold" style={{ color: isCur ? "#6366f1" : "var(--text-300)" }}>{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="h-44 flex flex-col items-center justify-center gap-3" style={{ color: "var(--text-300)" }}>
                    <BarChart3 style={{ width: 36, height: 36, opacity: 0.18 }} />
                    <p className="text-sm">Aucune donnée disponible</p>
                  </div>
                )}
              </div>
            </div>

            {/* Panneau droit */}
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl overflow-hidden relative animate-fade-in" style={{ boxShadow: "var(--shadow-lg)" }}>
                <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=70" alt=""
                  className="absolute inset-0 w-full h-full object-cover" style={{ filter: "brightness(0.12) saturate(0.7)" }} />
                <div className="absolute inset-0" style={{ background: "linear-gradient(160deg,#0f1f3d 0%,#1e3a8a 100%)" }} />
                <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(ellipse at 100% 0%,rgba(99,102,241,0.35) 0%,transparent 60%)" }} />
                <div className="relative z-10 p-5">
                  <p className="font-black text-sm text-white mb-4 flex items-center gap-2">
                    <TrendingUp style={{ width: 14, height: 14, color: "#6ee7b7" }} /> Résumé financier
                  </p>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative flex-shrink-0">
                      <svg width="84" height="84" viewBox="0 0 84 84">
                        <circle cx="42" cy="42" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                        <circle cx="42" cy="42" r={R} fill="none"
                          stroke={txPaie > 80 ? "#10b981" : txPaie > 50 ? "#f59e0b" : "#ef4444"}
                          strokeWidth="8" strokeLinecap="round"
                          strokeDasharray={CIRC} strokeDashoffset={DASH}
                          transform="rotate(-90 42 42)"
                          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)" }} />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-black text-white leading-none">{txPaie}%</span>
                        <span className="text-[9px] font-semibold" style={{ color: "rgba(255,255,255,0.35)" }}>payé</span>
                      </div>
                    </div>
                    <div className="space-y-2.5 flex-1">
                      {[
                        { l: "Inscrits",  v: String(data.elevesActifs),      c: "#93c5fd" },
                        { l: "Collecté",  v: `${fmt(data.totalCollecte)} F`, c: "#6ee7b7" },
                        { l: "Impayé",    v: `${fmt(data.montantImpaye)} F`, c: data.montantImpaye > 0 ? "#fca5a5" : "#6ee7b7" },
                      ].map(row => (
                        <div key={row.l} className="flex justify-between items-center">
                          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>{row.l}</span>
                          <span className="text-[11px] font-black" style={{ color: row.c }}>{row.v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {data.nbDebiteurs > 0 && (
                    <div className="flex items-center justify-between rounded-xl p-2.5 mb-3"
                      style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.2)" }}>
                      <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>Débiteurs</span>
                      <span className="text-[11px] font-black" style={{ color: "#fcd34d" }}>{data.nbDebiteurs} élève(s)</span>
                    </div>
                  )}
                  <button onClick={() => navigate("/paiements/stats")}
                    className="w-full py-2 rounded-xl text-xs font-semibold transition-all"
                    style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.14)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; }}>
                    Voir les statistiques →
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl animate-fade-in" style={{ boxShadow: "var(--shadow-md)" }}>
                <div className="px-4 pt-4 pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
                  <p className="font-bold text-sm" style={{ color: "var(--text-900)" }}>Actions rapides</p>
                </div>
                <div className="p-2 space-y-0.5">
                  {ACTIONS.map((a, ai) => (
                    <button key={a.path} onClick={() => navigate(a.path)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left animate-pay-feed"
                      style={{ animationDelay: `${ai * 60}ms`, transition: "background 0.15s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-app)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `linear-gradient(135deg,${a.g1},${a.g2})`, boxShadow: `0 2px 8px ${a.g1}55` }}>
                        <a.icon style={{ width: 13, height: 13, color: "#fff" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate" style={{ color: "var(--text-900)" }}>{a.label}</p>
                        <p className="text-[10px]" style={{ color: "var(--text-300)" }}>{a.sub}</p>
                      </div>
                      <ChevronRight style={{ width: 12, height: 12, color: "var(--text-300)", flexShrink: 0 }} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Paiements récents */}
          <div className="bg-white rounded-2xl overflow-hidden animate-fade-in" style={{ boxShadow: "var(--shadow-md)" }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <div>
                <p className="font-bold text-sm" style={{ color: "var(--text-900)" }}>Paiements récents</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-400)" }}>Dernières transactions enregistrées</p>
              </div>
              <button onClick={() => navigate("/paiements")}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
                style={{ color: "#6366f1", background: "rgba(99,102,241,0.08)" }}>
                Tout voir <ArrowRight style={{ width: 12, height: 12 }} />
              </button>
            </div>
            {data.recents && data.recents.length > 0 ? (
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {data.recents.slice(0, 6).map((p: any, i: number) => (
                  <button key={p.idPaie} onClick={() => navigate(`/paiements/${p.idPaie}`)}
                    className="w-full flex items-center gap-4 px-6 py-3.5 text-left animate-pay-feed"
                    style={{ animationDelay: `${i * 70}ms`, transition: "background 0.15s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--bg-app)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                      style={{ background: `linear-gradient(135deg,${GRAD_AVA[i % GRAD_AVA.length][0]},${GRAD_AVA[i % GRAD_AVA.length][1]})`, boxShadow: `0 3px 10px ${GRAD_AVA[i % GRAD_AVA.length][0]}55` }}>
                      {p.eleve?.prenom?.[0]}{p.eleve?.nom?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: "var(--text-900)" }}>{p.eleve?.prenom} {p.eleve?.nom}</p>
                      <p className="text-xs" style={{ color: "var(--text-400)" }}>{p.mode?.libelle ?? "—"} · {timeAgo(p.datePaie)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-base font-black" style={{ color: "#10b981", letterSpacing: "-0.03em" }}>
                        +{p.montant?.toLocaleString("fr-FR")}
                      </p>
                      <p className="text-[10px] font-bold" style={{ color: "var(--text-300)" }}>FCFA</p>
                    </div>
                    <ArrowUpRight style={{ width: 14, height: 14, color: "var(--text-300)", flexShrink: 0 }} />
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-14 gap-3" style={{ color: "var(--text-300)" }}>
                <TrendingUp style={{ width: 36, height: 36, opacity: 0.18 }} />
                <p className="text-sm">Aucun paiement récent</p>
                <button onClick={() => navigate("/paiements/nouveau")}
                  className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-xl mt-1"
                  style={{ background: "linear-gradient(135deg,#10b981,#059669)", boxShadow: "0 4px 14px rgba(16,185,129,0.3)" }}>
                  <Plus style={{ width: 14, height: 14 }} /> Enregistrer un paiement
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}