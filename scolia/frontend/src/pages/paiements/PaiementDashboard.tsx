// src/pages/paiements/PaiementDashboard.tsx — Version colorée premium
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet, TrendingUp, AlertTriangle,
  ArrowRight, Plus, CreditCard, BarChart3,
  ArrowUpRight, CheckCircle,
} from "lucide-react";
import { authFetch } from "../../service/auth";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

function getToken() { return localStorage.getItem("token") ?? ""; }
async function apiFetch(url: string) {
  const r = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } });
  return r.json();
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n/1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n/1_000).toFixed(0)}K`;
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

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#43e97b,#38f9d7)",
  "linear-gradient(135deg,#667eea,#764ba2)",
  "linear-gradient(135deg,#f093fb,#f5576c)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#f6d365,#fda085)",
];

const MOIS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];

export default function PaiementDashboard() {
  const navigate = useNavigate();
  const [annees, setAnnees]   = useState<any[]>([]);
  const [idAca, setIdAca]     = useState("");
  const [dash, setDash]       = useState<any>(null);
  const [stats, setStats]     = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

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
    setLoading(true);
    Promise.all([
      apiFetch(`${API}/paiements/dashboard?idAca=${idAca}`),
      apiFetch(`${API}/paiements/stats?idAca=${idAca}`),
    ]).then(([d, s]) => { setDash(d); setStats(s); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [idAca]);

  const maxMois = stats?.parMois?.length ? Math.max(...stats.parMois.map((m: any) => m.total), 1) : 1;
  const now = new Date();
  const moisCourant = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  const tauxRecouvrement = stats?.tauxGlobal ?? 0;

  const KPIS = dash ? [
    { label: "Total collecté",  value: `${fmt(dash.totalCollecte ?? 0)} FCFA`, icon: Wallet,       gradient: "linear-gradient(135deg,#43e97b,#38f9d7)", shadow: "rgba(67,233,123,0.35)" },
    { label: "Paiements",       value: dash.nbPaiements ?? 0,                  icon: CreditCard,   gradient: "linear-gradient(135deg,#4facfe,#00f2fe)", shadow: "rgba(79,172,254,0.35)" },
    { label: "Élèves à jour",   value: dash.nbElevesPayes ?? 0,                icon: CheckCircle,  gradient: "linear-gradient(135deg,#667eea,#764ba2)", shadow: "rgba(102,126,234,0.35)" },
    { label: "Débiteurs",       value: dash.nbDebiteurs ?? 0,                  icon: AlertTriangle,gradient: (dash.nbDebiteurs ?? 0) > 0 ? "linear-gradient(135deg,#f5576c,#f093fb)" : "linear-gradient(135deg,#43e97b,#38f9d7)", shadow: "rgba(245,87,108,0.35)" },
  ] : [];

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">

      {/* Bannière verte finance */}
      <div className={`rounded-2xl p-5 relative overflow-hidden transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
        style={{ background: "linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)", boxShadow: "0 4px 24px rgba(67,233,123,0.4)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.06) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(255,255,255,0.2) 0%,transparent 70%)" }} />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-4 h-4 text-emerald-100" />
              <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider">Gestion financière</p>
            </div>
            <h1 className="text-white text-2xl font-bold" style={{ letterSpacing: "-0.03em" }}>Finance & Paiements</h1>
            <p className="text-emerald-100/70 text-sm mt-1">
              Taux de recouvrement global : <span className="text-white font-bold">{tauxRecouvrement}%</span>
            </p>
          </div>
          <div className="flex gap-2">
            <select value={idAca} onChange={e => setIdAca(e.target.value)}
              className="appearance-none bg-white/20 border border-white/30 text-white text-xs font-medium px-3 py-2 rounded-xl focus:outline-none cursor-pointer backdrop-blur-sm">
              {annees.map(a => <option key={a.idAnnee} value={a.idAnnee} style={{ color: "#0f172a" }}>{a.libelle}</option>)}
            </select>
            <button onClick={() => navigate("/paiements/nouveau")}
              className="flex items-center gap-2 bg-white text-emerald-600 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-emerald-50 transition-all active:scale-[0.97]"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
              <Plus className="w-4 h-4" /> Nouveau paiement
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
            {KPIS.map((kpi, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 animate-fade-in relative overflow-hidden"
                style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)", transition: "all 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${kpi.shadow}`; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(15,31,61,0.06)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: kpi.gradient }} />
                <div className="flex items-center justify-between mt-1 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: kpi.gradient, boxShadow: `0 2px 8px ${kpi.shadow}` }}>
                    <kpi.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900" style={{ letterSpacing: "-0.03em" }}>{typeof kpi.value === "number" ? kpi.value.toLocaleString("fr-FR") : kpi.value}</p>
                <p className="text-xs text-slate-400 font-medium mt-1">{kpi.label}</p>
              </div>
            ))}
          </div>

          {/* Grille principale */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

            {/* Graphique */}
            <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 animate-fade-in"
              style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)" }}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Paiements par mois</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Évolution des encaissements</p>
                </div>
                <button onClick={() => navigate("/paiements/stats")}
                  className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700">
                  Stats détaillées <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {stats?.parMois?.length > 0 ? (
                <div className="flex items-end gap-2 h-48">
                  {stats.parMois.map((m: any) => {
                    const pct = Math.round((m.total / maxMois) * 100);
                    const label = MOIS[parseInt(m.mois.split("-")[1]) - 1] ?? m.mois;
                    const isCurrent = m.mois === moisCourant;
                    return (
                      <div key={m.mois} className="flex-1 flex flex-col items-center gap-1.5 group">
                        <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">{fmt(m.total)}</span>
                        <div className="w-full flex items-end" style={{ height: "140px" }}>
                          <div className="w-full rounded-t-lg transition-all duration-700 group-hover:opacity-80"
                            style={{
                              height: `${Math.max(pct, 4)}%`,
                              background: isCurrent ? "linear-gradient(180deg,#43e97b 0%,#38f9d7 100%)" : "linear-gradient(180deg,#e2e8f0 0%,#f1f5f9 100%)",
                              boxShadow: isCurrent ? "0 -2px 12px rgba(67,233,123,0.4)" : "none",
                            }} />
                        </div>
                        <span className={`text-[10px] font-semibold ${isCurrent ? "text-emerald-600" : "text-slate-400"}`}>{label}</span>
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

            {/* Par mode de paiement */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 animate-fade-in"
              style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-900">Par mode de paiement</h2>
              </div>
              {dash?.parMode && dash.parMode.length > 0 ? (
                <div className="space-y-3">
                  {dash.parMode.map((mode: any, i: number) => {
                    const pct = dash.totalCollecte > 0 ? Math.round((mode.total / dash.totalCollecte) * 100) : 0;
                    const GRADIENTS_MODE = ["linear-gradient(135deg,#43e97b,#38f9d7)","linear-gradient(135deg,#4facfe,#00f2fe)","linear-gradient(135deg,#f6d365,#fda085)","linear-gradient(135deg,#667eea,#764ba2)"];
                    return (
                      <div key={mode.idMode}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs font-semibold text-slate-700">{mode.mode?.libelle ?? "—"}</span>
                          <span className="text-xs font-bold text-slate-900">{pct}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-1000"
                            style={{ width: `${pct}%`, background: GRADIENTS_MODE[i % GRADIENTS_MODE.length] }} />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">{fmt(mode.total)} FCFA · {mode.nb} paiement{mode.nb > 1 ? "s" : ""}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-8">Aucun paiement enregistré</p>
              )}

              {/* Taux recouvrement */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-500 font-medium">Taux de recouvrement global</span>
                  <span className="font-bold text-slate-900">{tauxRecouvrement}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${tauxRecouvrement}%`, background: "linear-gradient(90deg,#43e97b,#38f9d7)" }} />
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
                <p className="text-xs text-slate-400 mt-0.5">10 dernières transactions</p>
              </div>
              <button onClick={() => navigate("/paiements")}
                className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700">
                Voir tout <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {dash?.recents?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {dash.recents.slice(0, 8).map((p: any, i: number) => (
                  <button key={p.idPaie} onClick={() => navigate(`/paiements/${p.idPaie}`)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length] }}>
                      {p.eleve?.prenom?.[0]}{p.eleve?.nom?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{p.eleve?.prenom} {p.eleve?.nom}</p>
                      <p className="text-xs text-slate-400">{p.mode?.libelle ?? "—"} · {timeAgo(p.datePaie)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-emerald-600">+{p.montant?.toLocaleString("fr-FR")}</p>
                      <p className="text-[10px] text-slate-400">FCFA</p>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-10 text-slate-400 gap-2">
                <TrendingUp className="w-8 h-8 opacity-20" />
                <p className="text-sm">Aucun paiement récent</p>
                <button onClick={() => navigate("/paiements/nouveau")} className="btn-primary mt-2 text-xs"
                  style={{ background: "linear-gradient(135deg,#43e97b,#38f9d7)" }}>
                  <Plus className="w-3.5 h-3.5" /> Enregistrer un paiement
                </button>
              </div>
            )}
          </div>

          {/* Actions rapides */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Nouveau paiement",  path: "/paiements/nouveau",    gradient: "linear-gradient(135deg,#43e97b,#38f9d7)", shadow: "rgba(67,233,123,0.3)" },
              { label: "Liste des paiements",path: "/paiements",           gradient: "linear-gradient(135deg,#4facfe,#00f2fe)", shadow: "rgba(79,172,254,0.3)" },
              { label: "Par classe",         path: "/paiements/par-classe",gradient: "linear-gradient(135deg,#f6d365,#fda085)", shadow: "rgba(246,211,101,0.3)" },
              { label: "Statistiques",       path: "/paiements/stats",     gradient: "linear-gradient(135deg,#667eea,#764ba2)", shadow: "rgba(102,126,234,0.3)" },
            ].map(item => (
              <button key={item.path} onClick={() => navigate(item.path)}
                className="rounded-2xl p-4 text-white font-semibold text-sm transition-all duration-150 active:scale-[0.97]"
                style={{ background: item.gradient, boxShadow: `0 4px 16px ${item.shadow}` }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${item.shadow}`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px ${item.shadow}`; }}>
                {item.label} →
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}