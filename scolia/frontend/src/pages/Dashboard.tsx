// src/pages/Dashboard.tsx — SCOLIA SGS — Version colorée premium
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, BookOpen, UserCheck, Wallet,
  AlertTriangle, Award, TrendingUp, ArrowUpRight,
  ArrowRight, BarChart3, Plus, ClipboardList,
  FileText, CreditCard, Sparkles,
} from "lucide-react";
import { authFetch, getUser } from "../service/auth";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

function getToken() { return localStorage.getItem("token") ?? ""; }
async function apiFetch(url: string) {
  const r = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } });
  return r.json();
}

// Compteur animé
function Counter({ value, suffix = "" }: { value: number | string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const numVal = typeof value === "number" ? value : parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0;
  const isText = typeof value === "string" && isNaN(Number(String(value).replace(/[^0-9.]/g, "")));

  useEffect(() => {
    if (isText) return;
    const start = performance.now();
    const duration = 1000;
    const step = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(numVal * ease));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [numVal]);

  if (isText) return <span>{value}{suffix}</span>;
  return <span>{display.toLocaleString("fr-FR")}{suffix}</span>;
}

interface DashData {
  totalEleves: number;
  totalClasses: number;
  totalEnseignants: number;
  totalCollecte: number;
  nbDebiteurs: number;
  tauxReussite: number;
  recents: any[];
  parMois: { mois: string; total: number }[];
  elevesActifs: number;
  paiementsMois: number;
  montantImpaye: number;
}

const MOIS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];

// Configurations couleurs des KPI — gradients riches
const KPI_CONFIG = [
  {
    label: "Élèves inscrits",
    icon: Users,
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    bg: "rgba(102,126,234,0.12)",
    iconColor: "#667eea",
    trend: "+12%",
    shadow: "rgba(102,126,234,0.3)",
    path: "/eleves",
  },
  {
    label: "Classes actives",
    icon: BookOpen,
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    bg: "rgba(240,147,251,0.12)",
    iconColor: "#f093fb",
    trend: "",
    shadow: "rgba(240,147,251,0.3)",
    path: "/classes",
  },
  {
    label: "Enseignants",
    icon: UserCheck,
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    bg: "rgba(79,172,254,0.12)",
    iconColor: "#4facfe",
    trend: "",
    shadow: "rgba(79,172,254,0.3)",
    path: "/enseignants",
  },
  {
    label: "Collecté (FCFA)",
    icon: Wallet,
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    bg: "rgba(67,233,123,0.12)",
    iconColor: "#43e97b",
    trend: "+8%",
    shadow: "rgba(67,233,123,0.3)",
    path: "/finance",
  },
  {
    label: "Débiteurs",
    icon: AlertTriangle,
    gradient: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
    bg: "rgba(246,211,101,0.12)",
    iconColor: "#fda085",
    trend: "",
    shadow: "rgba(253,160,133,0.3)",
    path: "/paiements/par-classe",
  },
  {
    label: "Taux de réussite",
    icon: Award,
    gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    bg: "rgba(161,140,209,0.12)",
    iconColor: "#a18cd1",
    trend: "+18%",
    shadow: "rgba(161,140,209,0.3)",
    path: "/notes/classement",
  },
];

export default function Dashboard() {
  const navigate  = useNavigate();
  const user      = getUser();
  const [data, setData]       = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [idAca, setIdAca]     = useState("");
  const [annees, setAnnees]   = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    authFetch(`${API}/annees`).then(r => r.json()).then((d: any) => {
      const list = Array.isArray(d) ? d : (d.data ?? []);
      setAnnees(list);
      if (list.length > 0) setIdAca(String(list[list.length - 1].idAnnee));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!idAca) return;
    loadData();
  }, [idAca]);

  async function loadData() {
    setLoading(true);
    try {
      const [eleves, classes, enseignants, dash, stats] = await Promise.all([
        apiFetch(`${API}/eleves?actif=1`),
        apiFetch(`${API}/classes`),
        apiFetch(`${API}/enseignants?actif=1`),
        apiFetch(`${API}/paiements/dashboard?idAca=${idAca}`),
        apiFetch(`${API}/paiements/stats?idAca=${idAca}`),
      ]);
      const now = new Date();
      const moisKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
      const paiementsMois = stats.parMois?.find((m: any) => m.mois === moisKey)?.nb ?? 0;
      setData({
        totalEleves: eleves.total ?? 0,
        totalClasses: (classes.data ?? classes).length ?? 0,
        totalEnseignants: (enseignants.data ?? enseignants).total ?? 0,
        totalCollecte: dash.totalCollecte ?? 0,
        nbDebiteurs: dash.nbDebiteurs ?? 0,
        tauxReussite: 92,
        recents: dash.recents ?? [],
        parMois: stats.parMois ?? [],
        elevesActifs: eleves.total ?? 0,
        paiementsMois,
        montantImpaye: Math.max(0, (stats.totalAttendu ?? 0) - (stats.totalCollecte ?? 0)),
      });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function fmt(n: number) {
    if (n >= 1_000_000) return `${(n/1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `${(n/1_000).toFixed(0)}K`;
    return String(n);
  }

  function timeAgo(d: string) {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "À l'instant";
    if (m < 60) return `${m}min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h/24)}j`;
  }

  const maxMois = data?.parMois?.length ? Math.max(...data.parMois.map(m => m.total), 1) : 1;
  const now = new Date();
  const moisCourant = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;

  const kpiValues = data ? [
    data.totalEleves,
    data.totalClasses,
    data.totalEnseignants,
    fmt(data.totalCollecte),
    data.nbDebiteurs,
    `${data.tauxReussite}%`,
  ] : [0, 0, 0, "0", 0, "0%"];

  const AVATAR_GRADIENTS = [
    "linear-gradient(135deg,#667eea,#764ba2)",
    "linear-gradient(135deg,#f093fb,#f5576c)",
    "linear-gradient(135deg,#4facfe,#00f2fe)",
    "linear-gradient(135deg,#43e97b,#38f9d7)",
    "linear-gradient(135deg,#f6d365,#fda085)",
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">

      {/* Header avec bannière de bienvenue */}
      <div className={`transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
        <div className="rounded-2xl p-5 flex items-center justify-between overflow-hidden relative"
          style={{
            background: "linear-gradient(135deg, #0f1f3d 0%, #1a3a5c 50%, #16324f 100%)",
            boxShadow: "0 4px 24px rgba(15,31,61,0.2)",
          }}>
          {/* Déco fond */}
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)",
              backgroundSize: "40px 40px",
            }} />
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)" }} />
          <div className="absolute -left-8 -bottom-12 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)" }} />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-blue-300" />
              <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider">Tableau de bord</p>
            </div>
            <h1 className="text-white text-2xl font-bold" style={{ letterSpacing: "-0.03em" }}>
              Bonjour, {user?.name} 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {annees.find(a => String(a.idAnnee) === idAca)?.libelle ?? ""}
              {" · "}Vue d'ensemble de votre établissement
            </p>
          </div>

          <div className="relative z-10 hidden md:flex items-center gap-3">
            {annees.length > 0 && (
              <select
                value={idAca}
                onChange={e => setIdAca(e.target.value)}
                className="appearance-none bg-white/10 border border-white/20 text-white text-xs font-medium px-4 py-2.5 rounded-xl focus:outline-none cursor-pointer backdrop-blur-sm"
                style={{ maxWidth: 200 }}
              >
                {annees.map(a => (
                  <option key={a.idAnnee} value={a.idAnnee} style={{ color: "#0f172a" }}>{a.libelle}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 space-y-3">
              <div className="skeleton w-10 h-10 rounded-xl" />
              <div className="skeleton h-8 w-16 rounded-lg" />
              <div className="skeleton h-3 w-20 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* KPI Cards — colorées avec gradient */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 stagger">
            {KPI_CONFIG.map((kpi, i) => (
              <button
                key={i}
                onClick={() => navigate(kpi.path)}
                className="relative bg-white rounded-2xl p-4 border border-slate-100 text-left overflow-hidden group animate-fade-in"
                style={{
                  boxShadow: `0 2px 8px rgba(15,31,61,0.06)`,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${kpi.shadow}`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(15,31,61,0.06)";
                }}
              >
                {/* Gradient background subtil */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                  style={{ background: `${kpi.bg}` }} />

                {/* Barre gradient en haut */}
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                  style={{ background: kpi.gradient }} />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3 mt-1">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: kpi.bg }}>
                      <kpi.icon className="w-5 h-5" style={{ color: kpi.iconColor }} />
                    </div>
                    {kpi.trend && (
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">
                        {kpi.trend}
                      </span>
                    )}
                  </div>

                  <p className="text-2xl font-bold text-slate-900" style={{ letterSpacing: "-0.03em" }}>
                    <Counter value={kpiValues[i]} />
                  </p>
                  <p className="text-xs text-slate-400 mt-1 font-medium">{kpi.label}</p>

                  {/* Mini barre de progression pour certains KPI */}
                  <div className="mt-2.5 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${Math.min(100, Math.max(10, (Number(kpiValues[i]) / (i === 0 ? 50 : i === 5 ? 100 : 20)) * 100))}%`,
                        background: kpi.gradient,
                      }} />
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

            {/* Graphique */}
            <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 animate-fade-in"
              style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)" }}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Paiements par mois</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {annees.find(a => String(a.idAnnee) === idAca)?.libelle}
                  </p>
                </div>
                <button onClick={() => navigate("/paiements/stats")}
                  className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
                  Voir tout <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {data?.parMois && data.parMois.length > 0 ? (
                <div className="flex items-end gap-2 h-48">
                  {data.parMois.map((m) => {
                    const pct = Math.round((m.total / maxMois) * 100);
                    const label = MOIS[parseInt(m.mois.split("-")[1]) - 1] ?? m.mois;
                    const isCurrent = m.mois === moisCourant;
                    return (
                      <div key={m.mois} className="flex-1 flex flex-col items-center gap-1.5 group">
                        <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                          {fmt(m.total)}
                        </span>
                        <div className="w-full flex items-end rounded-t-lg overflow-hidden" style={{ height: "140px" }}>
                          <div className="w-full rounded-t-lg transition-all duration-700 group-hover:opacity-90"
                            style={{
                              height: `${Math.max(pct, 4)}%`,
                              background: isCurrent
                                ? "linear-gradient(180deg,#667eea 0%,#764ba2 100%)"
                                : "linear-gradient(180deg,#e2e8f0 0%,#f1f5f9 100%)",
                              boxShadow: isCurrent ? "0 -2px 12px rgba(102,126,234,0.4)" : "none",
                            }}
                          />
                        </div>
                        <span className={`text-[10px] font-semibold ${isCurrent ? "text-violet-600" : "text-slate-400"}`}>
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-48 rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <BarChart3 className="w-8 h-8 opacity-20" />
                  <p className="text-sm">Aucune donnée pour cette année</p>
                </div>
              )}
            </div>

            {/* Résumé + Actions */}
            <div className="flex flex-col gap-4">

              {/* Résumé financier coloré */}
              <div className="rounded-2xl p-5 animate-fade-in text-white relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #0f1f3d 0%, #1e3a8a 100%)",
                  boxShadow: "0 4px 20px rgba(15,31,61,0.2)",
                }}>
                <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full"
                  style={{ background: "radial-gradient(circle,rgba(99,102,241,0.2) 0%,transparent 70%)" }} />
                <h2 className="text-sm font-bold text-white mb-4 relative z-10">Résumé financier</h2>
                <div className="space-y-3 relative z-10">
                  {[
                    { label: "Élèves inscrits",  value: String(data?.elevesActifs ?? 0),        color: "text-blue-200" },
                    { label: "Total collecté",   value: `${fmt(data?.totalCollecte ?? 0)} FCFA`, color: "text-emerald-300" },
                    { label: "Montant impayé",   value: `${fmt(data?.montantImpaye ?? 0)} FCFA`, color: (data?.montantImpaye ?? 0) > 0 ? "text-red-300" : "text-emerald-300" },
                    { label: "Débiteurs",        value: `${data?.nbDebiteurs ?? 0} élève(s)`,   color: (data?.nbDebiteurs ?? 0) > 0 ? "text-orange-300" : "text-emerald-300" },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between items-center">
                      <span className="text-xs text-blue-200/60">{row.label}</span>
                      <span className={`text-xs font-bold ${row.color}`}>{row.value}</span>
                    </div>
                  ))}

                  {/* Progress */}
                  <div className="pt-2 border-t border-white/10">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-blue-200/60">Taux de paiement</span>
                      <span className="text-white font-bold">
                        {data && data.elevesActifs > 0
                          ? Math.round(((data.elevesActifs - data.nbDebiteurs) / data.elevesActifs) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${data && data.elevesActifs > 0 ? Math.round(((data.elevesActifs - data.nbDebiteurs) / data.elevesActifs) * 100) : 0}%`,
                          background: "linear-gradient(90deg,#43e97b,#38f9d7)",
                        }} />
                    </div>
                  </div>
                </div>
                <button onClick={() => navigate("/paiements/stats")}
                  className="mt-4 w-full py-2.5 rounded-xl text-xs font-semibold text-white border border-white/20 hover:bg-white/10 transition-colors relative z-10">
                  Voir les statistiques →
                </button>
              </div>

              {/* Actions rapides colorées */}
              <div className="bg-white rounded-2xl border border-slate-100 p-4 animate-fade-in"
                style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)" }}>
                <h2 className="text-sm font-bold text-slate-900 mb-3">Actions rapides</h2>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Inscrire élève",  path: "/eleves/nouveau",    icon: Users,         gradient: "linear-gradient(135deg,#667eea,#764ba2)", shadow: "rgba(102,126,234,0.3)" },
                    { label: "Saisir notes",    path: "/notes/saisie",      icon: ClipboardList, gradient: "linear-gradient(135deg,#f093fb,#f5576c)", shadow: "rgba(240,147,251,0.3)" },
                    { label: "Paiement",        path: "/paiements/nouveau", icon: CreditCard,    gradient: "linear-gradient(135deg,#43e97b,#38f9d7)", shadow: "rgba(67,233,123,0.3)" },
                    { label: "Bulletin",        path: "/notes/bulletin",    icon: FileText,      gradient: "linear-gradient(135deg,#f6d365,#fda085)", shadow: "rgba(253,160,133,0.3)" },
                  ].map(item => (
                    <button key={item.path} onClick={() => navigate(item.path)}
                      className="flex flex-col items-start gap-2.5 p-3.5 rounded-2xl text-left transition-all duration-150 active:scale-[0.97] group"
                      style={{ background: "rgba(248,250,252,1)" }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px ${item.shadow}`;
                        (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.boxShadow = "none";
                        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                      }}
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: item.gradient, boxShadow: `0 2px 8px ${item.shadow}` }}>
                        <item.icon className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-xs font-semibold text-slate-700 leading-tight">{item.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Paiements récents */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 animate-fade-in"
            style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Paiements récents</h2>
                <p className="text-xs text-slate-400 mt-0.5">Dernières transactions enregistrées</p>
              </div>
              <button onClick={() => navigate("/paiements")}
                className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
                Tout voir <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {data?.recents && data.recents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                {data.recents.slice(0, 6).map((p: any, i: number) => (
                  <button key={p.idPaie} onClick={() => navigate(`/paiements/${p.idPaie}`)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length] }}>
                      {p.eleve?.prenom?.[0]}{p.eleve?.nom?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {p.eleve?.prenom} {p.eleve?.nom}
                      </p>
                      <p className="text-xs text-slate-400">
                        {p.mode?.libelle ?? "—"} · {timeAgo(p.datePaie)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold" style={{ color: "#43e97b" }}>
                        +{p.montant?.toLocaleString("fr-FR")}
                      </p>
                      <p className="text-[10px] text-slate-400">FCFA</p>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                <TrendingUp className="w-8 h-8 opacity-20" />
                <p className="text-sm">Aucun paiement récent</p>
                <button onClick={() => navigate("/paiements/nouveau")}
                  className="flex items-center gap-1.5 text-xs font-semibold text-white px-4 py-2 rounded-xl mt-1"
                  style={{ background: "linear-gradient(135deg,#43e97b,#38f9d7)" }}>
                  <Plus className="w-3.5 h-3.5" /> Enregistrer un paiement
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Variables pour AVATAR_GRADIENTS */}
    </div>
  );
}

