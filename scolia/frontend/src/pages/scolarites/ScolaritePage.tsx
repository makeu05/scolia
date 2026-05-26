// src/pages/scolarites/ScolaritePage.tsx — Version colorée premium
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Edit, CreditCard, Layers, } from "lucide-react";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

function getToken() { return localStorage.getItem("token") ?? ""; }

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n/1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n/1_000).toFixed(0)}K`;
  return n.toLocaleString("fr-FR");
}

const CYCLE_GRADIENTS = [
  { gradient: "linear-gradient(135deg,#667eea,#764ba2)", shadow: "rgba(102,126,234,0.3)" },
  { gradient: "linear-gradient(135deg,#f093fb,#f5576c)", shadow: "rgba(240,147,251,0.3)" },
  { gradient: "linear-gradient(135deg,#4facfe,#00f2fe)", shadow: "rgba(79,172,254,0.3)" },
  { gradient: "linear-gradient(135deg,#43e97b,#38f9d7)", shadow: "rgba(67,233,123,0.3)" },
  { gradient: "linear-gradient(135deg,#f6d365,#fda085)", shadow: "rgba(246,211,101,0.3)" },
];

export default function ScolaritePage() {
  const navigate = useNavigate();
  const [scolarites, setScolarites] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [mounted, setMounted]       = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch(`${API}/scolarites`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json())
      .then(d => setScolarites(Array.isArray(d) ? d : (d.data ?? [])))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalInscription = scolarites.reduce((s, sc) => s + (sc.inscription ?? 0), 0);
  const totalPension     = scolarites.reduce((s, sc) => s + (sc.pension ?? 0), 0);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">

      {/* Bannière */}
      <div className={`rounded-2xl p-5 relative overflow-hidden transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
        style={{ background: "linear-gradient(135deg,#a18cd1 0%,#fbc2eb 100%)", boxShadow: "0 4px 24px rgba(161,140,209,0.4)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.06) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(255,255,255,0.2) 0%,transparent 70%)" }} />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="w-4 h-4 text-purple-100" />
              <p className="text-purple-100 text-xs font-semibold uppercase tracking-wider">Tarification scolaire</p>
            </div>
            <h1 className="text-white text-2xl font-bold" style={{ letterSpacing: "-0.03em" }}>Scolarités</h1>
            <p className="text-purple-100/70 text-sm mt-1">{scolarites.length} tarif(s) configuré(s)</p>
          </div>
          <button onClick={() => navigate("/scolarites/ajouter")}
            className="flex items-center gap-2 bg-white text-purple-600 font-semibold text-sm px-5 py-3 rounded-xl hover:bg-purple-50 transition-all active:scale-[0.97]"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
            <Plus className="w-4 h-4" /> Nouveau tarif
          </button>
        </div>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-3 gap-4 stagger">
        {[
          { label: "Cycles configurés",  value: scolarites.length,             gradient: "linear-gradient(135deg,#a18cd1,#fbc2eb)", shadow: "rgba(161,140,209,0.3)" },
          { label: "Total inscriptions", value: `${fmt(totalInscription)} FCFA`, gradient: "linear-gradient(135deg,#4facfe,#00f2fe)", shadow: "rgba(79,172,254,0.3)" },
          { label: "Total pension",      value: `${fmt(totalPension)} FCFA`,     gradient: "linear-gradient(135deg,#43e97b,#38f9d7)", shadow: "rgba(67,233,123,0.3)" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-fade-in relative overflow-hidden"
            style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)", transition: "all 0.2s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${s.shadow}`; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(15,31,61,0.06)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: s.gradient }} />
            <p className="text-xl font-bold text-slate-900 mt-2" style={{ letterSpacing: "-0.02em" }}>{s.value}</p>
            <p className="text-xs text-slate-400 font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Grille des scolarités */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      ) : scolarites.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center"
          style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "linear-gradient(135deg,#a18cd1,#fbc2eb)" }}>
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-500 font-medium mb-4">Aucune scolarité configurée</p>
          <button onClick={() => navigate("/scolarites/ajouter")} className="btn-primary"
            style={{ background: "linear-gradient(135deg,#a18cd1,#fbc2eb)" }}>
            <Plus className="w-4 h-4" /> Créer le premier tarif
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {scolarites.map((sc, i) => {
            const c = CYCLE_GRADIENTS[i % CYCLE_GRADIENTS.length];
            const total = (sc.inscription ?? 0) + (sc.pension ?? 0);
            return (
              <div key={sc.idScolarite} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-fade-in group"
                style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)", transition: "all 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${c.shadow}`; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(15,31,61,0.06)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>

                {/* Header coloré */}
                <div className="p-5 text-white relative overflow-hidden" style={{ background: c.gradient }}>
                  <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full"
                    style={{ background: "radial-gradient(circle,rgba(255,255,255,0.15) 0%,transparent 70%)" }} />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                        <Layers className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/scolarites/${sc.idScolarite}`)}
                          className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                          <Eye className="w-4 h-4 text-white" />
                        </button>
                        <button onClick={() => navigate(`/scolarites/${sc.idScolarite}/modifier`)}
                          className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                          <Edit className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                    <p className="font-bold text-lg mt-3" style={{ letterSpacing: "-0.02em" }}>{sc.cycle?.libelle ?? `Cycle ${sc.idCycle}`}</p>
                    <p className="text-white/70 text-xs mt-0.5">{sc.nbreTranche} tranche{sc.nbreTranche > 1 ? "s" : ""}</p>
                  </div>
                </div>

                {/* Détails */}
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Inscription</span>
                    <span className="text-sm font-bold text-slate-900">{fmt(sc.inscription)} FCFA</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Pension</span>
                    <span className="text-sm font-bold text-slate-900">{fmt(sc.pension)} FCFA</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-600">Total annuel</span>
                      <span className="text-base font-bold" style={{ background: c.gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        {fmt(total)} FCFA
                      </span>
                    </div>
                  </div>

                  {/* Tranches */}
                  {sc.tranches && sc.tranches.length > 0 && (
                    <div className="pt-2 space-y-1.5">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Tranches</p>
                      {sc.tranches.map((t: any) => (
                        <div key={t.idTranche} className="flex justify-between items-center p-2 rounded-lg"
                          style={{ background: "rgba(0,0,0,0.02)" }}>
                          <span className="text-xs text-slate-600">{t.libelle}</span>
                          <span className="text-xs font-semibold text-slate-900">{fmt(t.montant)} FCFA</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}