// src/pages/paiements/PaiementStats.tsx — Version colorée premium
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, TrendingUp, Wallet, Users, AlertTriangle, ArrowRight } from "lucide-react";
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

const MOIS = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
const CLASS_GRADIENTS = [
  "linear-gradient(135deg,#43e97b,#38f9d7)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#f6d365,#fda085)",
  "linear-gradient(135deg,#667eea,#764ba2)",
  "linear-gradient(135deg,#f093fb,#f5576c)",
];

export default function PaiementStats() {
  const navigate  = useNavigate();
  const [annees, setAnnees]   = useState<any[]>([]);
  const [idAca, setIdAca]     = useState("");
  const [stats, setStats]     = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    authFetch(`${API}/annees`).then(r => r.json()).then((d: any) => {
      const list = Array.isArray(d) ? d : (d.data ?? []);
      setAnnees(list);
      if (list.length > 0) setIdAca(String(list[list.length - 1].idAnnee));
    });
  }, []);

  useEffect(() => {
    if (!idAca) return;
    setLoading(true);
    apiFetch(`${API}/paiements/stats?idAca=${idAca}`)
      .then(setStats).catch(console.error).finally(() => setLoading(false));
  }, [idAca]);

  const maxMois = stats?.parMois?.length ? Math.max(...stats.parMois.map((m: any) => m.total), 1) : 1;
  const now = new Date();
  const moisCourant = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">

      {/* Bannière */}
      <div className={`rounded-2xl p-5 relative overflow-hidden transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
        style={{ background: "linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)", boxShadow: "0 4px 24px rgba(79,172,254,0.4)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.06) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(255,255,255,0.2) 0%,transparent 70%)" }} />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-cyan-100" />
              <p className="text-cyan-100 text-xs font-semibold uppercase tracking-wider">Analyse financière</p>
            </div>
            <h1 className="text-white text-2xl font-bold" style={{ letterSpacing: "-0.03em" }}>Statistiques des paiements</h1>
            <p className="text-cyan-100/70 text-sm mt-1">Vue détaillée par classe, mode et période</p>
          </div>
          <select value={idAca} onChange={e => setIdAca(e.target.value)}
            className="appearance-none bg-white/20 border border-white/30 text-white text-xs font-medium px-3 py-2 rounded-xl focus:outline-none cursor-pointer backdrop-blur-sm">
            {annees.map(a => <option key={a.idAnnee} value={a.idAnnee} style={{ color: "#0f172a" }}>{a.libelle}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
      ) : stats && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
            {[
              { label: "Total collecté",  value: `${fmt(stats.totalCollecte ?? 0)} FCFA`, icon: Wallet,        gradient: "linear-gradient(135deg,#43e97b,#38f9d7)", shadow: "rgba(67,233,123,0.3)" },
              { label: "Total attendu",   value: `${fmt(stats.totalAttendu ?? 0)} FCFA`,  icon: TrendingUp,    gradient: "linear-gradient(135deg,#4facfe,#00f2fe)", shadow: "rgba(79,172,254,0.3)" },
              { label: "Élèves à jour",   value: stats.nbElevesPayes ?? 0,                icon: Users,         gradient: "linear-gradient(135deg,#667eea,#764ba2)", shadow: "rgba(102,126,234,0.3)" },
              { label: "Débiteurs",       value: stats.nbDebiteurs ?? 0,                  icon: AlertTriangle, gradient: "linear-gradient(135deg,#f6d365,#fda085)", shadow: "rgba(246,211,101,0.3)" },
            ].map((kpi, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-fade-in relative overflow-hidden"
                style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)", transition: "all 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${kpi.shadow}`; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(15,31,61,0.06)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: kpi.gradient }} />
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 mt-1"
                  style={{ background: kpi.gradient, boxShadow: `0 2px 8px ${kpi.shadow}` }}>
                  <kpi.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-xl font-bold text-slate-900" style={{ letterSpacing: "-0.02em" }}>{typeof kpi.value === "number" ? kpi.value.toLocaleString("fr-FR") : kpi.value}</p>
                <p className="text-xs text-slate-400 font-medium mt-1">{kpi.label}</p>
              </div>
            ))}
          </div>

          {/* Taux global */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 animate-fade-in"
            style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)" }}>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-bold text-slate-900">Taux de recouvrement global</h2>
              <span className="text-2xl font-bold" style={{ background: "linear-gradient(135deg,#43e97b,#38f9d7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {stats.tauxGlobal ?? 0}%
              </span>
            </div>
            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1500"
                style={{ width: `${stats.tauxGlobal ?? 0}%`, background: "linear-gradient(90deg,#43e97b,#38f9d7)", boxShadow: "0 0 12px rgba(67,233,123,0.4)" }} />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>0%</span><span>50%</span><span>100%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {/* Graphique par mois */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 animate-fade-in"
              style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)" }}>
              <h2 className="text-sm font-bold text-slate-900 mb-4">Évolution mensuelle</h2>
              {stats.parMois?.length > 0 ? (
                <div className="flex items-end gap-2 h-48">
                  {stats.parMois.map((m: any) => {
                    const pct = Math.round((m.total / maxMois) * 100);
                    const label = MOIS[parseInt(m.mois.split("-")[1]) - 1] ?? m.mois;
                    const isCurrent = m.mois === moisCourant;
                    return (
                      <div key={m.mois} className="flex-1 flex flex-col items-center gap-1.5 group">
                        <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">{fmt(m.total)}</span>
                        <div className="w-full flex items-end" style={{ height: "120px" }}>
                          <div className="w-full rounded-t-lg" style={{ height: `${Math.max(pct, 4)}%`, background: isCurrent ? "linear-gradient(180deg,#4facfe,#00f2fe)" : "#e2e8f0", transition: "all 0.7s", boxShadow: isCurrent ? "0 -2px 12px rgba(79,172,254,0.4)" : "none" }} />
                        </div>
                        <span className={`text-[10px] font-semibold ${isCurrent ? "text-blue-500" : "text-slate-400"}`}>{label}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-slate-400 text-sm">Aucune donnée</div>
              )}
            </div>

            {/* Par classe */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 animate-fade-in"
              style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-900">Recouvrement par classe</h2>
                <button onClick={() => navigate("/paiements/par-classe")} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  Détails <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              {stats.parClasse?.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {stats.parClasse.slice(0, 8).map((cl: any, i: number) => (
                    <div key={cl.idClasse}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-slate-700 truncate max-w-[140px]">{cl.libelle}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">{cl.nbEleves} élèves</span>
                          <span className="text-xs font-bold text-slate-900">{cl.tauxRecouvrement}%</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${cl.tauxRecouvrement}%`, background: CLASS_GRADIENTS[i % CLASS_GRADIENTS.length] }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-8">Aucune donnée par classe</p>
              )}
            </div>
          </div>

          {/* Par mode de paiement */}
          {stats.parMode?.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-slate-100 animate-fade-in"
              style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)" }}>
              <h2 className="text-sm font-bold text-slate-900 mb-4">Répartition par mode de paiement</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {stats.parMode.map((mode: any, i: number) => {
                  const pct = stats.totalCollecte > 0 ? Math.round((mode.total / stats.totalCollecte) * 100) : 0;
                  return (
                    <div key={mode.idMode} className="rounded-2xl p-4 text-white relative overflow-hidden"
                      style={{ background: CLASS_GRADIENTS[i % CLASS_GRADIENTS.length], boxShadow: "0 2px 8px rgba(15,31,61,0.1)" }}>
                      <p className="font-bold text-lg" style={{ letterSpacing: "-0.02em" }}>{pct}%</p>
                      <p className="text-white/80 text-xs font-semibold mt-0.5">{mode.libelle}</p>
                      <p className="text-white/60 text-xs mt-1">{fmt(mode.total)} FCFA</p>
                      <p className="text-white/60 text-xs">{mode.nb} paiement{mode.nb > 1 ? "s" : ""}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}