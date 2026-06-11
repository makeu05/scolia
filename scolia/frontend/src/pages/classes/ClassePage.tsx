// src/pages/classes/ClassePage.tsx — fix button-dans-button + 422

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Eye, Edit, Search, Building2, Layers } from "lucide-react";
import { getClasses, deleteClasse, type Classe } from "../../service/classe_service";
import { getCycles, createCycle, deleteCycle, type Cycle } from "../../service/cycle_service";

const CYCLE_GRADIENTS = [
  { gradient: "linear-gradient(135deg,#667eea,#764ba2)", shadow: "rgba(102,126,234,0.3)", light: "rgba(102,126,234,0.08)" },
  { gradient: "linear-gradient(135deg,#f093fb,#f5576c)", shadow: "rgba(240,147,251,0.3)", light: "rgba(240,147,251,0.08)" },
  { gradient: "linear-gradient(135deg,#4facfe,#00f2fe)", shadow: "rgba(79,172,254,0.3)",  light: "rgba(79,172,254,0.08)" },
  { gradient: "linear-gradient(135deg,#43e97b,#38f9d7)", shadow: "rgba(67,233,123,0.3)",  light: "rgba(67,233,123,0.08)" },
  { gradient: "linear-gradient(135deg,#f6d365,#fda085)", shadow: "rgba(253,160,133,0.3)", light: "rgba(253,160,133,0.08)" },
];

export default function ClassesPage() {
  const navigate = useNavigate();
  const [classes, setClasses]   = useState<Classe[]>([]);
  const [cycles, setCycles]     = useState<Cycle[]>([]);
  const [loading, setLoading]   = useState(false);
  const [page, setPage]         = useState(1);
  const [meta, setMeta]         = useState<any>(null);
  const [search, setSearch]     = useState("");
  const [idCycle, setIdCycle]   = useState("");
  const [showCycleForm, setShowCycleForm] = useState(false);
  const [cycleForm, setCycleForm] = useState({ libelle: "", description: "", idAdmin: "1" });
  const [mounted, setMounted]   = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getClasses(page, idCycle, search);
      setClasses(data.data || []); setMeta(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page, idCycle, search]);

  const fetchCycles = async () => {
    try { setCycles(await getCycles()); } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchCycles(); }, []);
  useEffect(() => { fetchClasses(); }, [fetchClasses]);

  async function handleCreateCycle(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createCycle(cycleForm);
      setCycleForm({ libelle: "", description: "", idAdmin: "1" });
      setShowCycleForm(false);
      fetchCycles(); fetchClasses();
    } catch { alert("Erreur lors de la création du cycle"); }
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">

      {/* Bannière */}
      <div className={`rounded-2xl p-5 relative overflow-hidden transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
        style={{ background: "linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)", boxShadow: "0 4px 24px rgba(79,172,254,0.4)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(255,255,255,0.2) 0%,transparent 70%)" }} />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-cyan-100" />
              <p className="text-cyan-100 text-xs font-semibold uppercase tracking-wider">Structure pédagogique</p>
            </div>
            <h1 className="text-white text-2xl font-bold" style={{ letterSpacing: "-0.03em" }}>Classes & Cycles</h1>
            <p className="text-cyan-100/70 text-sm mt-1">{cycles.length} cycle(s) · {meta?.total ?? 0} classe(s)</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowCycleForm(v => !v)}
              className="flex items-center gap-2 bg-white/20 border border-white/30 text-white font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-white/30 transition-all backdrop-blur-sm">
              <Layers className="w-4 h-4" /> {showCycleForm ? "Annuler" : "+ Cycle"}
            </button>
            <button onClick={() => navigate("/classes/nouveau")}
              className="flex items-center gap-2 bg-white text-cyan-600 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-cyan-50 transition-all active:scale-[0.97]"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
              <Plus className="w-4 h-4" /> Nouvelle classe
            </button>
          </div>
        </div>
      </div>

      {/* Formulaire nouveau cycle */}
      {showCycleForm && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 animate-fade-in"
          style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)" }}>
          <h3 className="text-sm font-bold text-slate-900 mb-4">Nouveau cycle</h3>
          <form onSubmit={handleCreateCycle} className="flex gap-3 flex-wrap">
            <input required className="input flex-1 min-w-[200px]" placeholder="Libellé (ex: Primaire, Collège…)"
              value={cycleForm.libelle} onChange={e => setCycleForm({ ...cycleForm, libelle: e.target.value })} />
            <input className="input flex-1 min-w-[200px]" placeholder="Description (optionnel)"
              value={cycleForm.description} onChange={e => setCycleForm({ ...cycleForm, description: e.target.value })} />
            <button type="submit" className="btn-primary">Créer le cycle</button>
          </form>
        </div>
      )}

      {/* ── Cycles ── */}
      {/* ✅ CORRECTION : <div> au lieu de <button> pour éviter button-dans-button */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Cycles disponibles</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 stagger">
          {cycles.map((cycle, i) => {
            const c = CYCLE_GRADIENTS[i % CYCLE_GRADIENTS.length];
            const isSelected = idCycle === String(cycle.idCycle);
            return (
              <div
                key={cycle.idCycle}
                role="button"
                tabIndex={0}
                onClick={() => setIdCycle(isSelected ? "" : String(cycle.idCycle))}
                onKeyDown={e => e.key === "Enter" && setIdCycle(isSelected ? "" : String(cycle.idCycle))}
                className="relative rounded-2xl p-4 text-left transition-all duration-200 animate-fade-in border overflow-hidden cursor-pointer select-none"
                style={{
                  background:   isSelected ? c.gradient : "white",
                  borderColor:  isSelected ? "transparent" : "#f1f5f9",
                  boxShadow:    isSelected ? `0 4px 16px ${c.shadow}` : "0 2px 8px rgba(15,31,61,0.06)",
                  transform:    isSelected ? "translateY(-2px)" : "translateY(0)",
                }}
                onMouseEnter={e => { if (!isSelected) { (e.currentTarget as HTMLElement).style.boxShadow = `0 6px 20px ${c.shadow}`; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}}
                onMouseLeave={e => { if (!isSelected) { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(15,31,61,0.06)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}}
              >
                {!isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: c.gradient }} />
                )}
                <p className={`font-bold text-sm mt-1 ${isSelected ? "text-white" : "text-slate-900"}`}>
                  {cycle.libelle}
                </p>
                <p className={`text-xs mt-1 ${isSelected ? "text-white/70" : "text-slate-400"}`}>
                  {cycle.classes?.length ?? 0} classe(s)
                </p>
                {/* ✅ Bouton suppression — stopPropagation pour ne pas déclencher la sélection */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    if (confirm("Supprimer ce cycle ?")) {
                      deleteCycle(cycle.idCycle);
                      fetchCycles();
                      fetchClasses();
                    }
                  }}
                  className={`absolute top-2 right-2 p-1 rounded-lg transition-colors ${
                    isSelected
                      ? "hover:bg-white/20 text-white/60"
                      : "hover:bg-red-50 text-slate-300 hover:text-red-500"
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher une classe…" className="input pl-10" />
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
        style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)" }}>
        <table className="w-full">
          <thead>
            <tr>{["Classe","Cycle","Cours","Actions"].map(h => <th key={h} className="table-th">{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 4 }).map((_, j) => (
                  <td key={j} className="table-td"><div className="skeleton h-4 rounded w-3/4" /></td>
                ))}</tr>
              ))
            ) : classes.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-16 text-center text-slate-400 text-sm">Aucune classe trouvée</td>
              </tr>
            ) : (
              classes.map((cl) => {
                const c = CYCLE_GRADIENTS[cycles.findIndex(cy => cy.idCycle === cl.idCycle) % CYCLE_GRADIENTS.length];
                return (
                  <tr key={cl.idClasse}
                    className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors cursor-pointer"
                    onClick={() => navigate(`/classes/${cl.idClasse}`)}>
                    <td className="table-td font-semibold text-slate-900">{cl.libelle}</td>
                    <td className="table-td">
                      {cl.cycle?.libelle
                        ? <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                            style={{ background: c?.gradient ?? "#e2e8f0" }}>{cl.cycle.libelle}</span>
                        : "—"}
                    </td>
                    <td className="table-td text-sm text-slate-500">{cl.cours_count ?? 0} cours</td>
                    {/* ✅ stopPropagation sur la cellule pour éviter la navigation */}
                    <td className="table-td" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button onClick={() => navigate(`/classes/${cl.idClasse}`)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => navigate(`/classes/${cl.idClasse}/modifier`)}
                          className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => { if (confirm("Supprimer cette classe ?")) { deleteClasse(cl.idClasse); fetchClasses(); } }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">{meta.total} classe(s)</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary py-2 px-4 disabled:opacity-40">Précédent</button>
            <span className="flex items-center px-3 text-sm text-slate-600">{page} / {meta.last_page}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page === meta.last_page} className="btn-secondary py-2 px-4 disabled:opacity-40">Suivant</button>
          </div>
        </div>
      )}
    </div>
  );
}